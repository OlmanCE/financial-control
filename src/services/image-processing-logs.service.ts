// src/services/image-processing-logs.service.ts
import { supabaseClient } from '@/lib/supabaseClient';

export interface ImageProcessingLog {
    id: string;
    user_id: string;
    image_url: string;
    movement_type: 'income' | 'expense';
    status: 'processing' | 'success' | 'error';
    ai_response: any;
    error_message: string | null;
    created_movement_id: string | null;
    created_at: string;
}

export interface CreateLogData {
    user_id: string;
    image_url: string;
    movement_type: 'income' | 'expense';
    status: 'processing' | 'success' | 'error';
    ai_response?: any;
    error_message?: string;
    created_movement_id?: string;
}

export const imageProcessingLogsService = {
    /**
     * Crea un log de procesamiento
     */
    async create(logData: CreateLogData): Promise<ImageProcessingLog> {
        try {
            const { data, error } = await supabaseClient
                .from('image_processing_logs')
                .insert({
                    user_id: logData.user_id,
                    image_url: logData.image_url,
                    movement_type: logData.movement_type,
                    status: logData.status,
                    ai_response: logData.ai_response || null,
                    error_message: logData.error_message || null,
                    created_movement_id: logData.created_movement_id || null,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating log:', error);
                throw new Error('Error al crear el log de procesamiento');
            }

            return data;
        } catch (error: any) {
            console.error('Image processing logs service error:', error);
            throw error;
        }
    },

    /**
     * Actualiza un log existente
     */
    // En image-processing-logs.service.ts

    async update(
        logId: string,
        updates: Partial<Omit<CreateLogData, 'user_id' | 'image_url' | 'movement_type'>>
    ): Promise<ImageProcessingLog> {
        try {
            const { data, error } = await supabaseClient
                .from('image_processing_logs')
                .update(updates)
                .eq('id', logId)
                .select(); // ✅ Quitar .single()

            if (error) {
                console.error('Error updating log:', error);
                throw new Error('Error al actualizar el log');
            }

            // ✅ Verificar que haya datos
            if (!data || data.length === 0) {
                console.warn('No se encontró el log para actualizar:', logId);
                throw new Error('Log no encontrado');
            }

            return data[0]; // ✅ Retornar primer elemento
        } catch (error: any) {
            console.error('Image processing logs service error:', error);
            throw error;
        }
    },

    /**
     * Obtiene todos los logs del usuario actual
     */
    async getAll(userId: string): Promise<ImageProcessingLog[]> {
        try {
            const { data, error } = await supabaseClient
                .from('image_processing_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching logs:', error);
                throw new Error('Error al obtener los logs');
            }

            return data || [];
        } catch (error: any) {
            console.error('Image processing logs service error:', error);
            throw error;
        }
    },

    /**
     * Obtiene logs con errores (para admin)
     */
    async getErrors(): Promise<ImageProcessingLog[]> {
        try {
            const { data, error } = await supabaseClient
                .from('image_processing_logs')
                .select('*')
                .eq('status', 'error')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching error logs:', error);
                throw new Error('Error al obtener los logs de errores');
            }

            return data || [];
        } catch (error: any) {
            console.error('Image processing logs service error:', error);
            throw error;
        }
    },
};