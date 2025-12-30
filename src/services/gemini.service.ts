// src/services/gemini.service.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_FUNCTION_ENDPOINT = `${SUPABASE_URL}/functions/v1/clever-api`;

export interface ExtractedInvoiceData {
    amount: number | null;
    category: string | null;
    source: string | null;
    description: string | null;
    confidence: 'high' | 'medium' | 'low';
}

export interface ExistingOptions {
    categories: string[];
    sources: string[];
}

export const geminiService = {
    async extractInvoiceData(
        imageUrl: string,
        movementType: 'income' | 'expense',
        existingOptions: ExistingOptions
    ): Promise<ExtractedInvoiceData> {
        try {
            console.log('🔄 Convirtiendo imagen a Base64...');
            const imageBase64 = await this.imageUrlToBase64(imageUrl);

            console.log('📝 Generando prompt...');
            const prompt = this.buildPrompt(movementType, existingOptions);

            console.log('🤖 Llamando a Supabase Edge Function...');

            const response = await fetch(GEMINI_FUNCTION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data: imageBase64,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 2048,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Edge Function Error:', errorText);
                throw new Error(`Edge Function Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Gemini response completa:', data);

            const candidate = data.candidates?.[0];

            if (!candidate) {
                throw new Error('No se recibió candidato en la respuesta');
            }

            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
                throw new Error('La respuesta fue bloqueada por filtros de seguridad');
            }

            const textParts = candidate.content?.parts?.filter((part: any) => part.text) || [];

            if (textParts.length === 0) {
                console.error('❌ No se encontraron parts de texto en:', candidate);
                throw new Error('No se recibió texto en la respuesta');
            }

            const fullText = textParts.map((part: any) => part.text).join('');

            console.log('📄 Texto completo extraído:', fullText);

            const extractedData = this.parseGeminiResponse(fullText);
            console.log('✅ Datos extraídos:', extractedData);

            return extractedData;
        } catch (error: any) {
            console.error('❌ Gemini service error:', error);
            throw new Error('Error al procesar la imagen con IA: ' + error.message);
        }
    },

    buildPrompt(movementType: 'income' | 'expense', existingOptions: ExistingOptions): string {
        const categoriesList = existingOptions.categories.length > 0
            ? existingOptions.categories.join(', ')
            : 'ninguna';

        const sourcesList = existingOptions.sources.length > 0
            ? existingOptions.sources.join(', ')
            : 'ninguna';

        const basePrompt = `Eres un asistente experto en extraer información de facturas y comprobantes en Costa Rica.

Analiza la imagen y responde SOLO con este JSON (sin markdown, sin explicaciones):

{
  "amount": número,
  "category": "texto",
  "source": "texto",
  "description": "texto",
  "confidence": "high" | "medium" | "low"
}

REGLAS OBLIGATORIAS:
1. amount: SOLO número decimal sin símbolos (ej: 15000.50)
2. Si ves ₡: extraer SOLO el número
3. Si no estás seguro: usar null
4. SINPE Móvil: monto + nombre persona/comercio + descripción breve
5. Responder SOLO el JSON, sin bloques de código

CATEGORÍAS EXISTENTES: ${categoriesList}
FUENTES EXISTENTES: ${sourcesList}

PRIORIDAD:
- Si coincide EXACTAMENTE con categoría/fuente existente → USAR ESA
- Si NO coincide → crear nueva en Title Case

SINPE Móvil específico:
- source = nombre de persona/comercio
- category = tipo de ${movementType === 'income' ? 'ingreso' : 'gasto'}
- description = referencia si visible
`;

        if (movementType === 'expense') {
            return basePrompt + `
CATEGORÍAS DE GASTOS (si no hay coincidencia):
Alimentación, Transporte, Servicios Públicos, Entretenimiento, Salud, Educación, Compras
`;
        } else {
            return basePrompt + `
CATEGORÍAS DE INGRESOS (si no hay coincidencia):
Salario, Venta, Servicios Profesionales, Transferencia, Pago de Cliente
`;
        }
    },

    parseGeminiResponse(responseText: string): ExtractedInvoiceData {
        try {
            let cleanedText = responseText.trim();

            if (cleanedText.includes('```')) {
                cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedText = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanedText);

            return {
                amount: parsed.amount !== null && parsed.amount !== undefined ? parseFloat(parsed.amount) : null,
                category: parsed.category || null,
                source: parsed.source || null,
                description: parsed.description || null,
                confidence: parsed.confidence || 'low',
            };
        } catch (error) {
            console.error('❌ Error parsing Gemini response:', error);
            console.error('Raw text:', responseText);
            throw new Error('No se pudo interpretar la respuesta de la IA.');
        }
    },

    async imageUrlToBase64(url: string): Promise<string> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error al descargar la imagen: ${response.status}`);
            }

            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    const base64Data = base64String.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error: any) {
            console.error('❌ Error converting image to base64:', error);
            throw new Error('Error al convertir la imagen: ' + error.message);
        }
    },
};