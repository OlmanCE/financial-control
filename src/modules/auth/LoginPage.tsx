// src/modules/auth/LoginPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/auth/useAuth";
import { LogIn, Mail, Lock, Chrome, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants/routes";
import { VALIDATION } from "@/lib/constants/validation";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user && role) {
      navigate(role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD);
    }
  }, [user, role, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        await authService.signUp({
          email: formData.email,
          password: formData.password,
        });
        setSuccess("¡Cuenta creada exitosamente!");
        setFormData({ email: "", password: "" });
      } else {
        await authService.signIn({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen gradient-light">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Control Financiero
          </h1>
          <p className="text-zinc-300 text-lg">
            Gestiona tus ingresos y egresos de manera simple y efectiva
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Fácil de usar</h3>
              <p className="text-zinc-400 text-sm">
                Interfaz intuitiva para registrar tus movimientos financieros
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-zinc-400 text-sm">
          © 2024 Control Financiero. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                {isSignUp ? "Crear cuenta" : "Bienvenido"}
              </h2>
              <p className="text-zinc-600">
                {isSignUp
                  ? "Completa los datos para crear tu cuenta"
                  : "Ingresa tus credenciales para continuar"}
              </p>
            </div>

            {error && (
              <Alert variant="error" onClose={() => setError("")} className="mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" onClose={() => setSuccess("")} className="mb-4">
                {success}
              </Alert>
            )}

            <Button
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full mb-6"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-zinc-500">
                  O continúa con email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-12"
                    placeholder="••••••••"
                    required
                    minLength={VALIDATION.MIN_PASSWORD_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Mínimo {VALIDATION.MIN_PASSWORD_LENGTH} caracteres
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <span>{isSignUp ? "Crear cuenta" : "Iniciar sesión"}</span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                  setFormData({ email: "", password: "" });
                }}
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {isSignUp ? (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <span className="font-semibold">Inicia sesión</span>
                  </>
                ) : (
                  <>
                    ¿No tienes cuenta?{" "}
                    <span className="font-semibold">Regístrate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}