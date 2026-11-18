import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import logoImg from "../img/logo.png";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { validarCorreo } from "../utils/validaciones";

export const RecuperarPasswordView = () => {
  const { setActiveView } = useApp();
  const [email, setEmail] = useState("barista@holacafe.com");
  const [emailError, setEmailError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errCorreo = validarCorreo(email);
    setEmailError(errCorreo);
    if (errCorreo) return;
    setSent(true);
  }

  return (
    <main className="login-page">
      <div className="ambient-glow ambient-glow--top" aria-hidden="true" />
      <div className="ambient-glow ambient-glow--bottom" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="recover-title">
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
            <h1 id="recover-title">¡Hola, Café!</h1>
            <p>Control de Comandas y Monitoreo de Mesas</p>
          </div>
        </header>

        <div className="text-center pb-4 pt-1">
          <h2 className="text-lg font-bold text-[#231815]">Olvidé mi contraseña</h2>
          <p className="text-xs text-[#7c6e65] mt-1 leading-relaxed">
            Te enviaremos un enlace a tu correo para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#231815]">¡Enlace enviado!</h3>
            <p className="text-xs text-[#7c6e65]">
              Hemos enviado las instrucciones a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </p>
            <button
              onClick={() => setActiveView("login")}
              className="mt-3 py-2.5 px-6 bg-[#e59819] hover:bg-[#d98d12] text-white rounded-xl font-semibold text-xs transition-all shadow-xs"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Correo electrónico</span>
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

            <button className="submit-button" type="submit">
              <span>Enviar enlace de recuperación</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setActiveView("login")}
                className="text-xs font-semibold text-[#7c6e65] hover:text-[#231815] flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio de sesión</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};
