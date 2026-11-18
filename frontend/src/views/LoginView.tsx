import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import logoImg from "../img/logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { validarCorreo, validarPassword } from "../utils/validaciones";

export const LoginView = () => {
  const { login, setActiveView } = useApp();
  const [email, setEmail] = useState("barista@holacafe.com");
  const [password, setPassword] = useState("HolaCafe#2026");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errCorreo = validarCorreo(email);
    const errPass = validarPassword(password);
    setEmailError(errCorreo);
    setPasswordError(errPass);
    if (errCorreo || errPass) return;
    login(email);
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
            <span className="field-label">Correo o usuario</span>
            <span className="input-wrap">
              <Mail className="field-icon field-icon--email" />
              <input
                type="text"
                name="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  setEmailError(validarCorreo(val));
                }}
                autoComplete="username"
                aria-label="Correo o usuario"
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
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  setPasswordError(validarPassword(val));
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
                onChange={(event) => setRememberSession(event.target.checked)}
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
        </form>

        <button
          className="register-link"
          type="button"
          onClick={() => setActiveView("registro")}
        >
          ¿No tienes una cuenta? Registrarse
        </button>

        <div className="mt-3 pt-3 border-t border-[#e8dfd8] flex items-center justify-center gap-2">
          <span className="text-[10px] font-bold text-[#7c6e65] uppercase tracking-wider">Demo:</span>
          <button
            type="button"
            onClick={() => login('admin@holacafe.com')}
            className="px-2 py-0.5 bg-[#fdfcfa] border border-[#e8dfd8] rounded text-[11px] font-semibold text-[#231815] hover:border-[#e59819] transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => login('dhuerta')}
            className="px-2 py-0.5 bg-[#fdfcfa] border border-[#e8dfd8] rounded text-[11px] font-semibold text-[#231815] hover:border-[#e59819] transition-colors"
          >
            Mesero
          </button>
          <button
            type="button"
            onClick={() => login('cocina@holacafe.com')}
            className="px-2 py-0.5 bg-[#fdfcfa] border border-[#e8dfd8] rounded text-[11px] font-semibold text-[#231815] hover:border-[#e59819] transition-colors"
          >
            Cocina
          </button>
        </div>
      </section>
    </main>
  );
};
