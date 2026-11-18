export function validarCorreo(email: string): string {
  if (!email.trim()) return '*El correo electrónico es obligatorio.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido (ej. usuario@holacafe.com).';
  return '';
}

export function validarPassword(password: string): string {
  if (!password) return '*La contraseña es obligatoria.';
  if (password.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número.';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
    return 'Debe incluir al menos un carácter especial (ej. # @ $ !).';
  }
  return '';
}

export function validarRequerido(valor: string, nombreCampo: string): string {
  if (!valor.trim()) return `*El campo ${nombreCampo} es obligatorio.`;
  return '';
}

export function validarPrecio(precio: string): string {
  const num = parseFloat(precio);
  if (!precio.trim() || isNaN(num)) return '*El precio es obligatorio.';
  if (num <= 0) return 'El precio debe ser mayor a $0.00.';
  return '';
}
