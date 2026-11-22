package com.holacafe.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroUsuarioRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres")
    private String nombre;
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Debe ser un formato de correo válido")
    private String correo;
    @NotBlank(message = "La contraseña es obligatoria")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#/._-])[A-Za-z\\d@$!%*?&#/._-]{8,}$", message = "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial")
    private String password;
    @NotNull(message = "El ID del rol es obligatorio")
    private Integer rolId; // 1: Admin, 2: Mesero, 3: Cocinero
}
