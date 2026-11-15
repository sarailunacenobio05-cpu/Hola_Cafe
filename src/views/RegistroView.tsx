import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import logoImg from "../img/logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User } from "lucide-react";

export const RegistroView = () => {
  const { setActiveView, login } = useApp();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("barista@holacafe.com");
  const [password, setPassword] = useState("HolaCafe#2026");
  const [confirmPassword, setConfirmPassword] = useState("HolaCafe#2026");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    login(email);
  }

  return (
    <main className="login-page">
      {/* Exact ambient glows from Figma */}
      <div className="ambient-glow ambient-glow--top" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--bottom" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="register-title">
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
            <h1 id="register-title">¡Hola, Café!</h1>
            <p>Control de Comandas y Monitoreo de Mesas</p>
          </div>
        </header>

        <div className="text-center pb-3 pt-0.5">
          <h2 className="text-lg font-bold text-[#231815]">Crear cuenta</h2>
          <p className="text-xs text-[#7c6e65] mt-0.5">
            Ingresa tus datos para registrarte en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nombre completo</span>
            <span className="input-wrap">
              <User className="field-icon field-icon--email" />
              <input
                type="text"
                name="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Daniel Huerta"
                autoComplete="name"
                aria-label="Nombre completo"
                required
              />
            </span>
          </label>

          <label className="field pt-3">
            <span className="field-label">Correo o usuario</span>
            <span className="input-wrap">
              <Mail className="field-icon field-icon--email" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="barista@holacafe.com"
                autoComplete="email"
                aria-label="Correo o usuario"
                required
              />
            </span>
          </label>

          <label className="field field--password">
            <span className="field-label">Contraseña</span>
            <span className="input-wrap">
              <Lock className="field-icon field-icon--lock" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
          </label>

          <label className="field field--password">
            <span className="field-label">Confirmar contraseña</span>
            <span className="input-wrap">
              <Lock className="field-icon field-icon--lock" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                aria-label="Confirmar contraseña"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((visible) => !visible)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
          </label>

          <button className="submit-button" type="submit">
            <span>Crear cuenta</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <div className="pt-4 text-center">
          <button
            className="register-link inline-flex items-center justify-center gap-1.5"
            type="button"
            onClick={() => setActiveView("login")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>¿Ya tienes una cuenta? Iniciar sesión</span>
          </button>
        </div>
      </section>
    </main>
  );
};
