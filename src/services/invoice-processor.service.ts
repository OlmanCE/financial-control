// src/services/invoice-processor.service.ts
import { storageService } from './storage.service';
import { geminiService, type ExistingOptions } from './gemini.service';
import { imageProcessingLogsService } from './image-processing-logs.service';
import { categoriesService, sourcesService, movementsService } from './movements.service';
import type { ExtractedInvoiceData } from './gemini.service';

export interface ProcessInvoiceResult {
  success: boolean;
  movementId?: string;
  logId: string;
  error?: string;
  extractedData?: ExtractedInvoiceData;
}

export const invoiceProcessorService = {
  /**
   * Procesa una imagen de factura completa:
   * 1. Obtiene categorías y fuentes existentes
   * 2. Sube imagen a Storage
   * 3. Crea log inicial
   * 4. Extrae datos con Gemini (pasando opciones existentes)
   * 5. Busca/crea categorías y fuentes
   * 6. Crea el movimiento (SIN proyecto, se pregunta después)
   * 7. Actualiza log
   */
  async processInvoice(
    file: File,
    userId: string,
    movementType: 'income' | 'expense'
  ): Promise<ProcessInvoiceResult> {
    let logId: string | null = null;
    let imagePath: string | null = null;

    try {
      // 1. Obtener categorías y fuentes existentes
      console.log('Obteniendo categorías y fuentes existentes...');
      const [categories, sources] = await Promise.all([
        categoriesService.getAll(movementType),
        sourcesService.getAll(movementType),
      ]);

      const existingOptions: ExistingOptions = {
        categories: categories.map((cat) => cat.name),
        sources: sources.map((src) => src.name),
      };

      // 2. Subir imagen a Storage
      console.log('Subiendo imagen...');
      const { url: imageUrl, path } = await storageService.uploadImage(file, userId, movementType);
      imagePath = path;

      // 3. Crear log inicial con estado "processing"
      console.log('Creando log inicial...');
      const log = await imageProcessingLogsService.create({
        user_id: userId,
        image_url: imageUrl,
        movement_type: movementType,
        status: 'processing',
      });
      logId = log.id;

      // 4. Extraer datos con Gemini (AHORA PASA LAS OPCIONES EXISTENTES)
      console.log('Extrayendo datos con IA...');
      const extractedData = await geminiService.extractInvoiceData(
        imageUrl,
        movementType,
        existingOptions
      );

      // Validar que al menos tengamos monto
      if (!extractedData.amount) {
        throw new Error('No se pudo extraer el monto de la imagen');
      }

      // 5. Buscar o crear categoría
      let categoryId: string | null = null;
      if (extractedData.category) {
        let category = await categoriesService.findByName(extractedData.category);
        if (!category) {
          console.log(`Creando nueva categoría: ${extractedData.category}`);
          category = await categoriesService.create(extractedData.category, movementType, userId);
        } else {
          console.log(`Usando categoría existente: ${category.name}`);
        }
        categoryId = category.id;
      }

      // 6. Buscar o crear fuente
      let sourceId: string | null = null;
      if (extractedData.source) {
        let source = await sourcesService.findByName(extractedData.source);
        if (!source) {
          console.log(`Creando nueva fuente: ${extractedData.source}`);
          source = await sourcesService.create(extractedData.source, movementType, userId);
        } else {
          console.log(`Usando fuente existente: ${source.name}`);
        }
        sourceId = source.id;
      }

      // 7. Crear movimiento (SIN PROYECTO - se pregunta después en el componente)
      console.log('Creando movimiento...');
      const movement = await movementsService.create({
        type: movementType,
        amount: extractedData.amount,
        category_id: categoryId,
        source_id: sourceId,
        project_id: null, // Por ahora null, se actualiza después si el usuario quiere
        description: extractedData.description,
        created_by: userId,
      });

      // 8. Actualizar log con éxito
      await imageProcessingLogsService.update(logId, {
        status: 'success',
        ai_response: extractedData,
        created_movement_id: movement.id,
      });

      return {
        success: true,
        movementId: movement.id,
        logId: logId,
        extractedData,
      };
    } catch (error: any) {
      console.error('Error processing invoice:', error);

      // Actualizar log con error
      if (logId) {
        try {
          await imageProcessingLogsService.update(logId, {
            status: 'error',
            error_message: error.message,
          });
        } catch (logError) {
          console.error('Error updating log:', logError);
        }
      }

      // Intentar limpiar la imagen subida si hay error
      if (imagePath) {
        try {
          await storageService.deleteImage(imagePath);
        } catch (deleteError) {
          console.error('Error deleting image after failure:', deleteError);
        }
      }

      return {
        success: false,
        logId: logId || 'unknown',
        error: error.message,
      };
    }
  },
};