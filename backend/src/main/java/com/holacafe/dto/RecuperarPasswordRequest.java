package com.holacafe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecuperarPasswordRequest {
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Ingresa un formato de correo válido")
    private String correo;
}
