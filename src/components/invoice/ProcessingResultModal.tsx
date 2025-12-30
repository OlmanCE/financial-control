// src/components/invoice/ProcessingResultModal.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComboboxField from '@/components/forms/ComboboxField';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { projectsService, movementsService, type Project } from '@/services/movements.service';
import type { ExtractedInvoiceData } from '@/services/gemini.service';

interface ProcessingResultModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  success: boolean;
  movementId?: string;
  extractedData?: ExtractedInvoiceData;
  error?: string;
  movementType: 'income' | 'expense';
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function ProcessingResultModal({
  isOpen,
  isProcessing,
  success,
  movementId,
  extractedData,
  error,
  movementType,
  userId,
  onClose,
  onComplete,
}: ProcessingResultModalProps) {
  const [showProjectQuestion, setShowProjectQuestion] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Cargar proyectos
  useEffect(() => {
    if (success && !isProcessing) {
      loadProjects();
    }
  }, [success, isProcessing]);

  const loadProjects = async () => {
    try {
      const projectsData = await projectsService.getAll(true);
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const handleCreateProject = async (name: string): Promise<Project> => {
    try {
      const newProject = await projectsService.create(name, userId);
      setProjects((prev) => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
      return newProject;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear el proyecto');
    }
  };

  const handleAssignProject = async () => {
    if (!movementId || !selectedProjectId) return;

    setIsAssigning(true);
    try {
      await movementsService.update(movementId, {
        project_id: selectedProjectId,
      });
      onComplete();
    } catch (err) {
      console.error('Error assigning project:', err);
      alert('Error al asignar el proyecto');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSkipProject = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={cn(
            'p-6 border-b border-border',
            isProcessing && 'bg-muted',
            success && 'bg-income/5',
            !isProcessing && !success && 'bg-expense/5'
          )}
        >
          <div className="flex items-center gap-3">
            {isProcessing && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            {!isProcessing && success && <CheckCircle className="w-6 h-6 text-income" />}
            {!isProcessing && !success && <XCircle className="w-6 h-6 text-expense" />}

            <h2 className="text-xl font-bold text-foreground">
              {isProcessing && 'Procesando imagen...'}
              {!isProcessing && success && '¡Registro exitoso!'}
              {!isProcessing && !success && 'Error al procesar'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Subiendo imagen...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Analizando con IA...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Creando registro...</span>
              </div>
            </div>
          )}

          {!isProcessing && success && extractedData && !showProjectQuestion && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monto</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(extractedData.amount || 0)}
                  </p>
                </div>

                {extractedData.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categoría</p>
                    <p className="font-medium text-foreground">{extractedData.category}</p>
                  </div>
                )}

                {extractedData.source && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fuente</p>
                    <p className="font-medium text-foreground">{extractedData.source}</p>
                  </div>
                )}

                {extractedData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                    <p className="text-sm text-foreground">{extractedData.description}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Confianza de la IA:{' '}
                    <span
                      className={cn(
                        'font-medium',
                        extractedData.confidence === 'high' && 'text-income',
                        extractedData.confidence === 'medium' && 'text-warning',
                        extractedData.confidence === 'low' && 'text-expense'
                      )}
                    >
                      {extractedData.confidence === 'high' && 'Alta'}
                      {extractedData.confidence === 'medium' && 'Media'}
                      {extractedData.confidence === 'low' && 'Baja'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Pregunta sobre proyecto */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-medium text-foreground mb-3">
                  ¿Este {movementType === 'income' ? 'ingreso' : 'gasto'} está relacionado con un
                  proyecto?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipProject}
                    className="flex-1"
                  >
                    No
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowProjectQuestion(true)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Sí
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isProcessing && success && showProjectQuestion && (
            <div className="space-y-4">
              <ComboboxField
                label="Proyecto"
                required={false}
                placeholder="Seleccionar proyecto..."
                options={projects.map((proj) => ({ id: proj.id, name: proj.name }))}
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                onCreateNew={handleCreateProject}
                allowCreate
                createLabel="Crear proyecto"
                emptyMessage="No se encontraron proyectos"
                searchPlaceholder="Buscar proyecto..."
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProjectQuestion(false)}
                  disabled={isAssigning}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={handleAssignProject}
                  disabled={!selectedProjectId || isAssigning}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar Proyecto'
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isProcessing && !success && error && (
            <div className="space-y-4">
              <div className="bg-expense/5 border border-expense/20 rounded-lg p-4">
                <p className="text-sm text-foreground">{error}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                El error ha sido registrado. Puedes intentar nuevamente con otra imagen.
              </p>

              <Button type="button" onClick={onClose} className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}