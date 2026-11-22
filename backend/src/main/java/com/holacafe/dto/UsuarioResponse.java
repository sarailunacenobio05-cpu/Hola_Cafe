package com.holacafe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private String id;
    private String nombre;
    private String correo;
    private String rol;
    private String estado;
    private String avatarUrl;
}
