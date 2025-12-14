// src/lib/constants/auth.ts
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  EMAIL_NOT_CONFIRMED: 'Por favor confirma tu email antes de iniciar sesión',
  USER_NOT_FOUND: 'Usuario no encontrado',
  WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
  EMAIL_ALREADY_REGISTERED: 'Este email ya está registrado',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  CAPTCHA_FAILED: 'Error de verificación. Intenta nuevamente',
  UNEXPECTED_ERROR: 'Ocurrió un error inesperado',
  ACCOUNT_DEACTIVATED: 'Tu cuenta ha sido desactivada. Por favor contacta al administrador.',
} as const;

export const AUTH_SUCCESS = {
  SIGNUP: '¡Cuenta creada exitosamente!',
  LOGIN: '¡Bienvenido de vuelta!',
  LOGOUT: 'Sesión cerrada correctamente',
  PASSWORD_RESET_SENT: 'Email de recuperación enviado',
} as const;

export const AUTH_MESSAGES = {
  ACCOUNT_DEACTIVATED_TITLE: 'Cuenta Desactivada',
  ACCOUNT_DEACTIVATED_DESCRIPTION: 'Tu cuenta ha sido desactivada. Por favor contacta al administrador.',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;