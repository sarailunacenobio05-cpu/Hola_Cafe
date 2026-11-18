import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import logoImg from "../img/logo.png";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User } from "lucide-react";
import { validarCorreo, validarPassword } from "../utils/validaciones";

export const RegistroView = () => {
  const { setActiveView, login } = useApp();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("barista@holacafe.com");
  const [password, setPassword] = useState("HolaCafe#2026");
  const [confirmPassword, setConfirmPassword] = useState("HolaCafe#2026");
  const [nombreError, setNombreError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errNombre = !nombre.trim() ? "El nombre completo es obligatorio." : "";
    const errCorreo = validarCorreo(email);
    const errPass = validarPassword(password);
    const errConfirm = password !== confirmPassword ? "Las contraseñas no coinciden." : "";

    setNombreError(errNombre);
    setEmailError(errCorreo);
    setPasswordError(errPass);
    setConfirmError(errConfirm);

    if (errNombre || errCorreo || errPass || errConfirm) return;
    login(email);
  }

  return (
    <main className="login-page">
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

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nombre completo</span>
            <span className="input-wrap">
              <User className="field-icon field-icon--email" />
              <input
                type="text"
                name="name"
                value={nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  setNombre(val);
                  setNombreError(!val.trim() ? "El nombre completo es obligatorio." : "");
                }}
                placeholder="Daniel Huerta"
                autoComplete="name"
                aria-label="Nombre completo"
                required
              />
            </span>
            {nombreError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {nombreError}
              </span>
            )}
          </label>

          <label className="field pt-3">
            <span className="field-label">Correo o usuario</span>
            <span className="input-wrap">
              <Mail className="field-icon field-icon--email" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  setEmailError(validarCorreo(val));
                }}
                placeholder="barista@holacafe.com"
                autoComplete="email"
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
                  if (confirmPassword) {
                    setConfirmError(val !== confirmPassword ? "Las contraseñas no coinciden." : "");
                  }
                }}
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
            {passwordError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {passwordError}
              </span>
            )}
          </label>

          <label className="field field--password">
            <span className="field-label">Confirmar contraseña</span>
            <span className="input-wrap">
              <Lock className="field-icon field-icon--lock" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  setConfirmError(password !== val ? "Las contraseñas no coinciden." : "");
                }}
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
            {confirmError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {confirmError}
              </span>
            )}
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
