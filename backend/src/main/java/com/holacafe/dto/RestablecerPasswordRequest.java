package com.holacafe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestablecerPasswordRequest {
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Ingresa un formato de correo válido")
    private String correo;

    @NotBlank(message = "El código de recuperación es obligatorio")
    private String codigo;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#/._-])[A-Za-z\\d@$!%*?&#/._-]{8,}$",
        message = "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial"
    )
    private String nuevaPassword;
}
