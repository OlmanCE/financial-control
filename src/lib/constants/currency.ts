// src/lib/constants/currency.ts

export const CURRENCY = {
  SYMBOL: '₡',
  CODE: 'CRC',
  NAME: 'Colón Costarricense',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

export const CURRENCY_FORMAT = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999999.99, // 999 billones
  REGEX: /^\d{1,3}(,\d{3})*(\.\d{2})?$/,
} as const;