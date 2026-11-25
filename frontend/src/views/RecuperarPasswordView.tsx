import { FormEvent, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import logoImg from "../img/logo.png";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { validarCorreo, validarPassword } from "../utils/validaciones";

type Paso = "solicitar" | "restablecer" | "completado";

export const RecuperarPasswordView = () => {
  const { setActiveView } = useApp();
  const [paso, setPaso] = useState<Paso>("solicitar");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [codigo, setCodigo] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [infoMensaje, setInfoMensaje] = useState("");
  const [codigoDesarrollo, setCodigoDesarrollo] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSolicitarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    const errCorreo = validarCorreo(email);
    setEmailError(errCorreo);
    if (errCorreo) return;

    setCargando(true);
    try {
      const { data } = await api.post("/auth/recuperar-password", {
        correo: email.trim().toLowerCase(),
      });
      setInfoMensaje(data.mensaje || "Código de verificación enviado.");
      setCodigoDesarrollo(data.codigoDesarrollo || null);
      setPaso("restablecer");
    } catch (error: any) {
      setServerError(
        error?.message ||
          error?.response?.data?.message ||
          "No se pudo enviar el código de recuperación."
      );
    } finally {
      setCargando(false);
    }
  }

  async function handleRestablecer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const errCod = !codigo.trim() ? "Ingresa el código de 6 dígitos." : "";
    const errPass = validarPassword(nuevaPassword);
    const errConf =
      !confirmarPassword
        ? "Confirma tu nueva contraseña."
        : nuevaPassword !== confirmarPassword
          ? "Las contraseñas no coinciden."
          : "";

    setCodigoError(errCod);
    setPasswordError(errPass);
    setConfirmError(errConf);
    if (errCod || errPass || errConf) return;

    setCargando(true);
    try {
      await api.post("/auth/restablecer-password", {
        correo: email.trim().toLowerCase(),
        codigo: codigo.trim(),
        nuevaPassword,
      });
      setPaso("completado");
    } catch (error: any) {
      const detalles: Record<string, string> | undefined =
        error?.errors || error?.validaciones;
      if (detalles && Object.keys(detalles).length > 0) {
        setServerError(Object.values(detalles).join(" · "));
      } else {
        setServerError(
          error?.message ||
            error?.response?.data?.message ||
            "No se pudo actualizar la contraseña."
        );
      }
    } finally {
      setCargando(false);
    }
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
          <h2 className="text-lg font-bold text-[#231815]">
            {paso === "solicitar"
              ? "Olvidé mi contraseña"
              : paso === "restablecer"
                ? "Restablecer contraseña"
                : "¡Contraseña actualizada!"}
          </h2>
          <p className="text-xs text-[#7c6e65] mt-1 leading-relaxed">
            {paso === "solicitar"
              ? "Ingresa tu correo electrónico registrado para enviarte un código de verificación."
              : paso === "restablecer"
                ? `Ingresa el código enviado a ${email} y define tu nueva contraseña.`
                : "Ya puedes iniciar sesión con tu nueva contraseña."}
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {paso === "completado" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-[#7c6e65]">
              La contraseña de <strong>{email}</strong> fue actualizada correctamente en el sistema.
            </p>
            <button
              type="button"
              onClick={() => setActiveView("login")}
              className="mt-2 py-2.5 px-6 bg-[#e59819] hover:bg-[#d98d12] text-white rounded-xl font-semibold text-xs transition-all shadow-xs"
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}

        {paso === "solicitar" && (
          <form className="login-form" onSubmit={handleSolicitarCodigo} noValidate>
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
                  placeholder="correo@holacafe.com"
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

            <button className="submit-button" type="submit" disabled={cargando}>
              <span>{cargando ? "Enviando código..." : "Enviar código de recuperación"}</span>
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

        {paso === "restablecer" && (
          <form className="login-form" onSubmit={handleRestablecer} noValidate>
            {infoMensaje && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-semibold">{infoMensaje}</p>
                {codigoDesarrollo && (
                  <p className="font-mono text-sm font-black tracking-widest text-[#7B3F00]">
                    Código: {codigoDesarrollo}
                  </p>
                )}
              </div>
            )}

            <label className="field">
              <span className="field-label">Código de verificación (6 dígitos)</span>
              <span className="input-wrap">
                <KeyRound className="field-icon field-icon--email" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCodigo(val);
                    setCodigoError(val ? "" : "Ingresa el código de 6 dígitos.");
                  }}
                  placeholder="Ej. 482910"
                  required
                />
              </span>
              {codigoError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {codigoError}
                </span>
              )}
            </label>

            <label className="field field--password">
              <span className="field-label">Nueva contraseña</span>
              <span className="input-wrap">
                <Lock className="field-icon field-icon--lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNuevaPassword(val);
                    setPasswordError(validarPassword(val));
                  }}
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
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
              <span className="field-label">Confirmar nueva contraseña</span>
              <span className="input-wrap">
                <Lock className="field-icon field-icon--lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmarPassword(val);
                    setConfirmError(nuevaPassword !== val ? "Las contraseñas no coinciden." : "");
                  }}
                  placeholder="Repite tu nueva contraseña"
                  required
                />
              </span>
              {confirmError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {confirmError}
                </span>
              )}
            </label>

            <button className="submit-button" type="submit" disabled={cargando}>
              <span>{cargando ? "Guardando..." : "Cambiar contraseña"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setPaso("solicitar");
                  setServerError("");
                }}
                className="text-xs font-semibold text-[#7c6e65] hover:text-[#231815] flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Usar otro correo</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};
