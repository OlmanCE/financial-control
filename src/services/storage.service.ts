// src/services/storage.service.ts
import { supabaseClient } from '@/lib/supabaseClient';

const BUCKET_NAME = 'invoice-images';

export interface UploadImageResult {
  url: string;
  path: string;
}

export const storageService = {
  /**
   * Sube una imagen al bucket de Supabase Storage
   * La imagen se guarda en una carpeta con el user_id: {user_id}/{timestamp}_{filename}
   */
  async uploadImage(
    file: File,
    userId: string,
    movementType: 'income' | 'expense'
  ): Promise<UploadImageResult> {
    try {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WebP.');
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('La imagen es muy grande. El tamaño máximo es 5MB.');
      }

      // Crear nombre único para el archivo
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${movementType}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Subir archivo
      const { data, error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error('Error al subir la imagen: ' + error.message);
      }

      // Obtener URL pública (signed URL temporal)
      const { data: urlData } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .createSignedUrl(data.path, 60 * 60 * 24); // 24 horas

      if (!urlData?.signedUrl) {
        throw new Error('Error al generar URL de la imagen');
      }

      return {
        url: urlData.signedUrl,
        path: data.path,
      };
    } catch (error: any) {
      console.error('Storage service error:', error);
      throw error;
    }
  },

  /**
   * Elimina una imagen del storage
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Error deleting image:', error);
        throw new Error('Error al eliminar la imagen');
      }
    } catch (error: any) {
      console.error('Storage service error:', error);
      throw error;
    }
  },

  /**
   * Obtiene una URL firmada temporal para una imagen
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

      if (error || !data?.signedUrl) {
        throw new Error('Error al obtener URL de la imagen');
      }

      return data.signedUrl;
    } catch (error: any) {
      console.error('Storage service error:', error);
      throw error;
    }
  },
};