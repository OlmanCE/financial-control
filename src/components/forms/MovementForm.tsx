// src/components/forms/MovementForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import ComboboxField from './ComboboxField';
import ImageUploader from '@/components/invoice/ImageUploader';
import ProcessingResultModal from '@/components/invoice/ProcessingResultModal';
import { cn } from '@/lib/utils';
import {
  categoriesService,
  sourcesService,
  projectsService,
  movementsService,
  type Category,
  type Source,
  type Project,
} from '@/services/movements.service';
import {
  formatCurrencyInput,
  parseCurrency,
  getAmountErrorMessage,
  formatCurrency,
} from '@/lib/utils/currency';
import { CURRENCY } from '@/lib/constants/currency';
import { ROUTES } from '@/lib/constants/routes';
import { invoiceProcessorService, type ProcessInvoiceResult } from '@/services/invoice-processor.service';
import { Image as ImageIcon } from 'lucide-react';

interface MovementFormProps {
  type: 'income' | 'expense';
}

interface FormData {
  amount: string;
  category_id: string | null;
  source_id: string | null;
  project_id: string | null;
  description: string;
}

interface FormErrors {
  amount?: string;
  category_id?: string;
  source_id?: string;
}

export default function MovementForm({ type }: MovementFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    category_id: null,
    source_id: null,
    project_id: null,
    description: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');

  // Estados para las opciones de los combobox
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estados para registro mediante imagen
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessInvoiceResult | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [categoriesData, sourcesData, projectsData] = await Promise.all([
          categoriesService.getAll(type),
          sourcesService.getAll(type),
          projectsService.getAll(true),
        ]);

        setCategories(categoriesData);
        setSources(sourcesData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
        showErrorToast('Error al cargar los datos del formulario');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [type]);

  // Manejo del input de monto con formateo automático
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCurrencyInput(rawValue);
    
    setFormData((prev) => ({
      ...prev,
      amount: formattedValue,
    }));

    // Limpiar error de monto si existe
    if (formErrors.amount) {
      setFormErrors((prev) => ({
        ...prev,
        amount: undefined,
      }));
    }
  };

  // Manejo de cambios en campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validar monto
    const parsedAmount = parseCurrency(formData.amount);
    const amountError = getAmountErrorMessage(parsedAmount);
    if (amountError) {
      errors.amount = amountError;
    }

    // Validar categoría
    if (!formData.category_id) {
      errors.category_id = 'La categoría es requerida';
    }

    // Validar fuente
    if (!formData.source_id) {
      errors.source_id = 'La fuente es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear nueva categoría
  const handleCreateCategory = async (name: string): Promise<Category> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const newCategory = await categoriesService.create(name, type, user.id);
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      showSuccessToast(`Categoría "${name}" creada exitosamente`);
      return newCategory;
    } catch (error: any) {
      showErrorToast(error.message || 'Error al crear la categoría');
      throw error;
    }
  };

  // Crear nueva fuente
  const handleCreateSource = async (name: string): Promise<Source> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const newSource = await sourcesService.create(name, type, user.id);
      setSources((prev) => [...prev, newSource].sort((a, b) => a.name.localeCompare(b.name)));
      showSuccessToast(`Fuente "${name}" creada exitosamente`);
      return newSource;
    } catch (error: any) {
      showErrorToast(error.message || 'Error al crear la fuente');
      throw error;
    }
  };

  // Crear nuevo proyecto
  const handleCreateProject = async (name: string): Promise<Project> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const newProject = await projectsService.create(name, user.id);
      setProjects((prev) => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
      showSuccessToast(`Proyecto "${name}" creado exitosamente`);
      return newProject;
    } catch (error: any) {
      showErrorToast(error.message || 'Error al crear el proyecto');
      throw error;
    }
  };

  // Helpers para toast
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastVariant('error');
    setShowToast(true);
  };

  // Submit del formulario manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showErrorToast('Usuario no autenticado');
      return;
    }

    // Validar formulario
    if (!validateForm()) {
      showErrorToast('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseCurrency(formData.amount);
      if (!parsedAmount) {
        throw new Error('Monto inválido');
      }

      // Crear el movimiento
      await movementsService.create({
        type,
        amount: parsedAmount,
        category_id: formData.category_id,
        source_id: formData.source_id,
        project_id: formData.project_id || null,
        description: formData.description.trim() || null,
        created_by: user.id,
      });

      showSuccessToast(
        `${type === 'income' ? 'Ingreso' : 'Egreso'} registrado exitosamente por ${formatCurrency(parsedAmount)}`
      );

      // Resetear formulario
      setFormData({
        amount: '',
        category_id: null,
        source_id: null,
        project_id: null,
        description: '',
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(ROUTES.USER_ENTRY);
      }, 2000);
    } catch (error: any) {
      console.error('Error creating movement:', error);
      showErrorToast(error.message || 'Error al registrar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de registro mediante imagen
  const handleImageSelected = async (file: File) => {
    if (!user) {
      showErrorToast('Usuario no autenticado');
      return;
    }

    setShowImageUploader(false);
    setShowProcessingModal(true);
    setIsProcessingImage(true);

    try {
      const result = await invoiceProcessorService.processInvoice(file, user.id, type);
      setProcessingResult(result);
    } catch (error: any) {
      console.error('Error processing invoice:', error);
      setProcessingResult({
        success: false,
        logId: 'unknown',
        error: error.message || 'Error desconocido al procesar la imagen',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleProcessingComplete = () => {
    setShowProcessingModal(false);
    setProcessingResult(null);
    
    showSuccessToast(
      `${type === 'income' ? 'Ingreso' : 'Egreso'} registrado exitosamente mediante imagen`
    );

    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate(ROUTES.USER_ENTRY);
    }, 2000);
  };

  const handleCancelImageUpload = () => {
    setShowImageUploader(false);
  };

  const handleCancel = () => {
    navigate(ROUTES.USER_ENTRY);
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner spinner-lg text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Modal de subida de imagen */}
      {showImageUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Subir imagen de {type === 'income' ? 'ingreso' : 'egreso'}
            </h3>
            <ImageUploader
              onImageSelected={handleImageSelected}
              onCancel={handleCancelImageUpload}
              movementType={type}
            />
          </div>
        </div>
      )}

      {/* Modal de procesamiento y resultado */}
      {showProcessingModal && processingResult && user && (
        <ProcessingResultModal
          isOpen={showProcessingModal}
          isProcessing={isProcessingImage}
          success={processingResult.success}
          movementId={processingResult.movementId}
          extractedData={processingResult.extractedData}
          error={processingResult.error}
          movementType={type}
          userId={user.id}
          onClose={() => {
            setShowProcessingModal(false);
            setProcessingResult(null);
          }}
          onComplete={handleProcessingComplete}
        />
      )}

      <div className={cn(
        "card max-w-2xl mx-auto",
        type === 'income' ? 'financial-form-card' : 'financial-form-card-expense'
      )}>
        {/* Toast de notificaciones */}
        {showToast && (
          <Toast
            variant={toastVariant}
            title={toastVariant === 'success' ? '¡Éxito!' : 'Error'}
            description={toastMessage}
            onClose={() => setShowToast(false)}
            duration={6000}
          />
        )}

        {/* Sugerencia de registro mediante imagen */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                💡 ¿Tienes una imagen de la factura?
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Sube la imagen y la IA extraerá automáticamente los datos del {type === 'income' ? 'ingreso' : 'egreso'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUploader(true)}
                className="gap-2 border-primary/30 hover:bg-primary/5"
              >
                <ImageIcon className="w-4 h-4" />
                Registrar mediante imagen
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Monto */}
          <div>
            <Label htmlFor="amount" required>
              Monto
            </Label>
            <div className="amount-input-wrapper">
              <span className={type === 'income' ? 'currency-symbol-income' : 'currency-symbol-expense'}>
                {CURRENCY.SYMBOL}
              </span>
              <Input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                error={!!formErrors.amount}
                errorMessage={formErrors.amount}
                className={cn(
                  'pl-10',
                  type === 'income' ? 'amount-input-income' : 'amount-input-expense'
                )}
                disabled={isSubmitting}
              />
            </div>
            <p className="form-helper-text">
              <svg className="form-helper-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ingresa el monto sin formato. Las comas se agregarán automáticamente.</span>
            </p>
          </div>

          {/* Categoría */}
          <ComboboxField
            label="Categoría"
            required
            placeholder="Seleccionar categoría..."
            options={categories.map((cat) => ({ id: cat.id, name: cat.name }))}
            value={formData.category_id}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, category_id: value }))
            }
            onCreateNew={handleCreateCategory}
            error={formErrors.category_id}
            disabled={isSubmitting}
            allowCreate
            createLabel="Crear categoría"
            emptyMessage="No se encontraron categorías"
            searchPlaceholder="Buscar categoría..."
          />

          {/* Fuente */}
          <ComboboxField
            label="Fuente"
            required
            placeholder="Seleccionar fuente..."
            options={sources.map((source) => ({ id: source.id, name: source.name }))}
            value={formData.source_id}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, source_id: value }))
            }
            onCreateNew={handleCreateSource}
            error={formErrors.source_id}
            disabled={isSubmitting}
            allowCreate
            createLabel="Crear fuente"
            emptyMessage="No se encontraron fuentes"
            searchPlaceholder="Buscar fuente..."
          />

          {/* Proyecto (opcional) */}
          <ComboboxField
            label="Proyecto"
            required={false}
            placeholder="Seleccionar proyecto (opcional)..."
            options={projects.map((project) => ({ id: project.id, name: project.name }))}
            value={formData.project_id}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, project_id: value }))
            }
            onCreateNew={handleCreateProject}
            disabled={isSubmitting}
            allowCreate
            createLabel="Crear proyecto"
            emptyMessage="No se encontraron proyectos"
            searchPlaceholder="Buscar proyecto..."
          />

          {/* Descripción */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Descripción</Label>
              <span className="optional-badge">Opcional</span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Agrega detalles adicionales sobre este movimiento..."
              rows={3}
              disabled={isSubmitting}
              className="form-textarea"
              maxLength={500}
            />
            <p className="form-helper-text">
              <svg className="form-helper-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Máximo 500 caracteres · {500 - formData.description.length} restantes</span>
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'sm:flex-1',
                type === 'income' ? 'submit-btn-income' : 'submit-btn-expense',
                isSubmitting && 'opacity-70 cursor-wait'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner spinner-sm border-white"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                `Registrar ${type === 'income' ? 'Ingreso' : 'Egreso'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}