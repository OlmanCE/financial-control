// src/components/invoice/ImageUploader.tsx
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onCancel: () => void;
  movementType: 'income' | 'expense';
}

export default function ImageUploader({
  onImageSelected,
  onCancel,
  movementType,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se aceptan imágenes JPG, PNG o WebP');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onImageSelected(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview de imagen o zona de upload */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-96 object-contain rounded-lg border-2 border-border"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
            aria-label="Eliminar imagen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            movementType === 'income' ? 'hover:bg-income/5' : 'hover:bg-expense/5'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                movementType === 'income' ? 'bg-income/10' : 'bg-expense/10'
              )}
            >
              <ImageIcon
                className={cn(
                  'w-8 h-8',
                  movementType === 'income' ? 'text-income' : 'text-expense'
                )}
              />
            </div>

            <div>
              <p className="text-base font-medium text-foreground mb-1">
                Selecciona o arrastra una imagen
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG o WebP (máx. 5MB)
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Galería
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Info sobre el tipo de factura esperada */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium text-foreground mb-1">
          💡 {movementType === 'income' ? 'Ingresos' : 'Gastos'} esperados:
        </p>
        <p className="text-muted-foreground">
          {movementType === 'income'
            ? 'Comprobantes de SINPE, transferencias bancarias, facturas de venta, etc.'
            : 'Facturas de compra, recibos, comprobantes de pago, etc.'}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedFile}
          className={cn(
            'flex-1',
            movementType === 'income'
              ? 'bg-income hover:bg-income-dark'
              : 'bg-expense hover:bg-expense-dark'
          )}
        >
          Procesar Imagen
        </Button>
      </div>
    </div>
  );
}