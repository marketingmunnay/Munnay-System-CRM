import React, { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../shared/Icons.tsx";

interface LoginPageProps {
  onLogin: (usuario: string, password?: string) => Promise<void> | void;
  error: string;
  logoUrl?: string;
  loginImageUrl?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920";

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, logoUrl, loginImageUrl }) => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const heroImage = loginImageUrl || FALLBACK_IMAGE;

  useEffect(() => {
    const remembered = localStorage.getItem("munnay.rememberedUser");
    if (remembered) {
      setUsuario(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onLogin(usuario.trim(), password);
      if (rememberMe) {
        localStorage.setItem("munnay.rememberedUser", usuario.trim());
      } else {
        localStorage.removeItem("munnay.rememberedUser");
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950">
      <img
        src={heroImage}
        alt="Login background"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white/90 shadow-2xl backdrop-blur-lg md:grid-cols-[440px,1fr]">
          <div className="p-8 sm:p-10 md:p-12 bg-white">
            <div className="flex flex-col gap-6">
              {logoUrl ? (
                <img src={logoUrl} alt="Munnay logo" className="h-10 object-contain" />
              ) : (
                <p className="text-xl font-semibold tracking-[0.4em] text-[#b9784a]">
                  MUNNAY
                </p>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Bienvenido de vuelta
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  Inicia sesión para continuar
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Ingresa tus credenciales corporativas para acceder al panel.
                </p>
              </div>
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Usuario</label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#b9784a] focus:ring-2 focus:ring-[#b9784a]/20"
                    placeholder="usuario@munnay"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-[#b9784a] focus:ring-2 focus:ring-[#b9784a]/20"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#b9784a] focus:ring-[#b9784a]"
                    />
                    Recuérdame
                  </label>
                  <button type="button" className="font-semibold text-[#b9784a] hover:text-[#a3653c]">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
                </button>
              </form>
            </div>
          </div>
          <div className="relative hidden overflow-hidden md:block">
            <img src={heroImage} alt="Fondo de login" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
            <div className="relative flex h-full items-end justify-end p-8">
              <div className="rounded-3xl bg-black/40 px-6 py-4 backdrop-blur-lg">
                <p className="text-xs uppercase tracking-[0.4em] text-white/80">Portal Corporativo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
