import { FormEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useApp } from "../context/AppContext";
import { authService } from "../api/authService";
import logoImg from "../img/logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { validarCorreo } from "../utils/validaciones";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

export const LoginView = () => {
  const { login, loginWithGoogle, setActiveView } = useApp();
  const rememberedEmail = authService.getRememberedEmail();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(Boolean(rememberedEmail));
  const [googleCargando, setGoogleCargando] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const rememberRef = useRef(rememberSession);

  useEffect(() => {
    rememberRef.current = rememberSession;
  }, [rememberSession]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    let cancelled = false;
    let attempts = 0;

    const inicializarGoogle = () => {
      if (cancelled || !googleButtonRef.current) return;
      const gsi = window.google?.accounts?.id;
      if (!gsi) {
        if (attempts < 25) {
          attempts += 1;
          setTimeout(inicializarGoogle, 200);
        }
        return;
      }

      gsi.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) return;
          setGoogleCargando(true);
          try {
            await loginWithGoogle(response.credential, rememberRef.current);
          } finally {
            setGoogleCargando(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      gsi.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 320,
        locale: "es",
      });
    };

    inicializarGoogle();
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errCorreo = validarCorreo(email);
    const errPass = !password.trim() ? "*La contraseña es obligatoria." : "";
    setEmailError(errCorreo);
    setPasswordError(errPass);
    if (errCorreo || errPass) return;
    await login(email, password, rememberSession);
  }

  return (
    <main className="login-page" data-node-id="42:1048">
      <div className="ambient-glow ambient-glow--top" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--bottom" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="login-title">
        <header className="brand-header">
          <div className="brand" aria-label="Hola Café">
            <span className="logo-frame">
              <img src={logoImg} alt="Hola Café" />
            </span>
            <span className="connection-status" aria-label="Conexión activa">
              <span />
            </span>
          </div>

          <div className="heading-copy">
            <h1 id="login-title">¡Hola, Café!</h1>
            <p>Control de Comandas y Monitoreo de Mesas</p>
          </div>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Correo electrónico</span>
            <span className="input-wrap">
              <Mail className="field-icon field-icon--email" />
              <input
                type="email"
                name="email"
                value={email}
                placeholder="correo@holacafe.com"
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  setEmailError(validarCorreo(val));
                }}
                autoComplete="email"
                aria-label="Correo electrónico"
                required
              />
            </span>
            {emailError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {emailError}
              </span>
            )}
          </label>

          <label className="field field--password">
            <span className="field-label">Contraseña</span>
            <span className="input-wrap">
              <Lock className="field-icon field-icon--lock" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="Ingresa tu contraseña"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                autoComplete="current-password"
                aria-label="Contraseña"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
            {passwordError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {passwordError}
              </span>
            )}
          </label>

          <div className="session-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setRememberSession(checked);
                  if (!checked) {
                    authService.clearRememberedEmail();
                  }
                }}
              />
              <span>Recordar sesión</span>
            </label>
            <button
              className="text-link"
              type="button"
              onClick={() => setActiveView("recuperar-password")}
            >
              Olvidé mi contraseña
            </button>
          </div>

          <button className="submit-button" type="submit">
            <span>Entrar al Sistema</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

          <div className="flex items-center gap-3 my-1">
            <span className="h-px flex-1 bg-[#E5DCD3]" />
            <span className="text-[11px] font-semibold text-[#8C7D73] uppercase tracking-wider">
              o continúa con
            </span>
            <span className="h-px flex-1 bg-[#E5DCD3]" />
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div className="flex flex-col items-center gap-2">
              <div
                ref={googleButtonRef}
                className={googleCargando ? "opacity-60 pointer-events-none" : ""}
              />
              {googleCargando && (
                <span className="text-xs font-semibold text-[#786B63]">
                  Verificando cuenta de Google...
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                Swal.fire({
                  icon: "info",
                  title: "Configura Google Sign-In",
                  html: `<p style="font-size:13px;color:#5C4E45;">Agrega tu <strong>Client ID</strong> de Google Cloud en <code>frontend/.env</code> (<code>VITE_GOOGLE_CLIENT_ID</code>) y en <code>application.properties</code> (<code>google.oauth.client-id</code>).</p>`,
                  confirmButtonText: "Entendido",
                  confirmButtonColor: "#7B3F00",
                  background: "#FFFFFF",
                  color: "#1E110A",
                })
              }
              className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF8F5] border border-[#D5C7BA] rounded-xl text-xs font-bold text-[#1E110A] flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          )}
        </form>
      </section>
    </main>
  );
};
