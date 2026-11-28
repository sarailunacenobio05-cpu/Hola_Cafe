package com.holacafe.dto;

import lombok.Data;

@Data
public class IoTEventoRequest {
    private String mesa;
    private String botonId;
    private String estado;
    private Integer bateria;
}
