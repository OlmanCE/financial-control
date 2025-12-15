// src/lib/utils/currency.ts
import { CURRENCY, CURRENCY_FORMAT } from '@/lib/constants/currency';

/**
 * Formatea un número a formato de colones costarricenses
 * @param amount - El monto a formatear
 * @param includeSymbol - Si debe incluir el símbolo ₡
 * @returns String formateado (ejemplo: "₡1,000,000.00")
 */
export function formatCurrency(amount: number | string, includeSymbol = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return includeSymbol ? `${CURRENCY.SYMBOL}0.00` : '0.00';
  }

  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: CURRENCY.DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY.DECIMAL_PLACES,
  });

  return includeSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
}

/**
 * Parsea un string de moneda a número
 * Acepta formatos: "1000000", "1,000,000", "1000000.50", "₡1,000,000.00"
 * @param value - El valor a parsear
 * @returns El número parseado o null si es inválido
 */
export function parseCurrency(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  // Remover símbolo de moneda y espacios
  let cleaned = value.replace(CURRENCY.SYMBOL, '').trim();
  
  // Remover separadores de miles (comas)
  cleaned = cleaned.replace(/,/g, '');
  
  // Convertir a número
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Formatea un input del usuario mientras escribe
 * Añade comas automáticamente y limita decimales
 * @param value - El valor actual del input
 * @returns El valor formateado
 */
export function formatCurrencyInput(value: string): string {
  // Remover todo excepto números y punto decimal
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // Permitir solo un punto decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limitar decimales a 2
  if (parts.length === 2 && parts[1].length > CURRENCY.DECIMAL_PLACES) {
    parts[1] = parts[1].slice(0, CURRENCY.DECIMAL_PLACES);
    cleaned = parts.join('.');
  }
  
  // Formatear la parte entera con comas
  if (parts[0]) {
    const integerPart = parseInt(parts[0], 10);
    if (!isNaN(integerPart)) {
      const formatted = integerPart.toLocaleString('en-US');
      cleaned = parts.length === 2 ? `${formatted}.${parts[1]}` : formatted;
    }
  }
  
  return cleaned;
}

/**
 * Valida que un monto sea válido
 * @param amount - El monto a validar
 * @returns true si es válido, false si no
 */
export function validateAmount(amount: number | string | null): boolean {
  if (amount === null || amount === undefined || amount === '') {
    return false;
  }

  const numAmount = typeof amount === 'string' ? parseCurrency(amount) : amount;
  
  if (numAmount === null || isNaN(numAmount)) {
    return false;
  }

  return numAmount >= CURRENCY_FORMAT.MIN_AMOUNT && numAmount <= CURRENCY_FORMAT.MAX_AMOUNT;
}

/**
 * Obtiene un mensaje de error para un monto inválido
 * @param amount - El monto a validar
 * @returns Mensaje de error o null si es válido
 */
export function getAmountErrorMessage(amount: number | string | null): string | null {
  if (amount === null || amount === undefined || amount === '') {
    return 'El monto es requerido';
  }

  const numAmount = typeof amount === 'string' ? parseCurrency(amount) : amount;
  
  if (numAmount === null || isNaN(numAmount)) {
    return 'El monto debe ser un número válido';
  }

  if (numAmount < CURRENCY_FORMAT.MIN_AMOUNT) {
    return `El monto debe ser mayor o igual a ${formatCurrency(CURRENCY_FORMAT.MIN_AMOUNT)}`;
  }

  if (numAmount > CURRENCY_FORMAT.MAX_AMOUNT) {
    return `El monto debe ser menor o igual a ${formatCurrency(CURRENCY_FORMAT.MAX_AMOUNT)}`;
  }

  return null;
}