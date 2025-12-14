// src/modules/auth/LoginPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/auth/useAuth";
import { Mail, Lock, Chrome, Eye, EyeOff, TrendingUp, Shield, PieChart } from "lucide-react"
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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-darker p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <TrendingUp className="w-5 h-5 text-income" />
            <span className="text-white/90 text-sm font-medium">Control Financiero</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Gestiona tus
            <br />
            finanzas con
            <br />
            confianza
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Toma el control total de tus ingresos, gastos y ahorra de manera inteligente con nuestra plataforma.
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-income" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Seguimiento en tiempo real</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Visualiza tus movimientos financieros al instante con gráficos y reportes detallados
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">100% Seguro</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Tus datos están protegidos con encriptación de nivel bancario
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
              <PieChart className="w-6 h-6 text-savings" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Análisis inteligente</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Recibe insights personalizados sobre tus hábitos financieros
              </p>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm relative z-10">
          © 2025 Control Financiero. Todos los derechos reservados.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Control Financiero</span>
            </div>
          </div>

          <div className="card">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {isSignUp ? "Crear cuenta" : "Bienvenido de nuevo"}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isSignUp
                  ? "Comienza a gestionar tus finanzas hoy"
                  : "Ingresa para continuar con tu control financiero"}
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
              className="w-full mb-6 h-12 text-base bg-transparent"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-medium">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-11 h-12 text-base"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 pr-12 h-12 text-base"
                    placeholder="••••••••"
                    required
                    minLength={VALIDATION.MIN_PASSWORD_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-target"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Mínimo {VALIDATION.MIN_PASSWORD_LENGTH} caracteres requeridos
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>{isSignUp ? "Crear mi cuenta" : "Iniciar sesión"}</span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setSuccess("")
                  setFormData({ email: "", password: "" })
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-target"
              >
                {isSignUp ? (
                  <span>
                    ¿Ya tienes cuenta? <span className="font-semibold text-primary">Inicia sesión</span>
                  </span>
                ) : (
                  <span>
                    ¿No tienes cuenta? <span className="font-semibold text-primary">Regístrate gratis</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 lg:hidden">
            © 2025 Control Financiero. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
