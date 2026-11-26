import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import { authService } from "../api/authService";
import logoImg from "../img/logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { validarCorreo } from "../utils/validaciones";

export const LoginView = () => {
  const { login, setActiveView } = useApp();
  const rememberedEmail = authService.getRememberedEmail();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(Boolean(rememberedEmail));

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
        </form>
      </section>
    </main>
  );
};
