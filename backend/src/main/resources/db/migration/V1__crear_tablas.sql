-- HOLA CAFÉ - MIGRACIÓN INICIAL V1 DDL DE BASE DE DATOS
-- Motor: MySQL (InnoDB, UTF-8 Multibyte)

-- 1. TABLA ROLES
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA USUARIOS
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    ultimo_acceso DATETIME NULL,
    avatar_url VARCHAR(255) NULL,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA TOKENS_RECUPERACION
CREATE TABLE tokens_recuperacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA TOKENS_REVOCADOS (Blacklist para invalidar JWT en logout)
CREATE TABLE tokens_revocados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    fecha_revocacion DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA CORTES_CAJA
CREATE TABLE cortes_caja (
    folio VARCHAR(50) PRIMARY KEY,
    responsable_id VARCHAR(36) NOT NULL,
    total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monto_efectivo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monto_tarjeta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    monto_transferencia_qr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_tickets INT NOT NULL DEFAULT 0,
    observaciones TEXT NULL,
    fecha DATETIME NOT NULL,
    CONSTRAINT fk_cortes_responsable FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA MESAS
CREATE TABLE mesas (
    id VARCHAR(20) PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Limpia / Disponible',
    mesero_id VARCHAR(36) NULL,
    CONSTRAINT fk_mesas_mesero FOREIGN KEY (mesero_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA DISPOSITIVOS_IOT
CREATE TABLE dispositivos_iot (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    mesa_id VARCHAR(20) NULL,
    bateria INT NOT NULL DEFAULT 100,
    estado VARCHAR(50) NOT NULL DEFAULT 'En línea',
    CONSTRAINT fk_dispositivos_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLA ALERTAS
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id VARCHAR(50) NOT NULL,
    mesa_id VARCHAR(20) NOT NULL,
    usuario_id VARCHAR(36) NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_alertas_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos_iot(id) ON DELETE CASCADE,
    CONSTRAINT fk_alertas_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE,
    CONSTRAINT fk_alertas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLA CATEGORIAS_MENU
CREATE TABLE categorias_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLA PRODUCTOS_MENU
CREATE TABLE productos_menu (
    id VARCHAR(36) PRIMARY KEY,
    categoria_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    permite_notas_cocina TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_menu(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABLA OPCIONES_PRODUCTO
CREATE TABLE opciones_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id VARCHAR(36) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_extra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_opciones_producto FOREIGN KEY (producto_id) REFERENCES productos_menu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABLA ORDENES_COMANDAS
CREATE TABLE ordenes_comandas (
    id VARCHAR(36) PRIMARY KEY,
    folio INT NOT NULL,
    mesa_id VARCHAR(20) NOT NULL,
    mesero_id VARCHAR(36) NOT NULL,
    corte_caja_id VARCHAR(50) NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Abierta',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    propina DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago VARCHAR(50) NULL,
    monto_pagado DECIMAL(10,2) NULL,
    cambio DECIMAL(10,2) NULL,
    telefono VARCHAR(20) NULL,
    fecha DATETIME NOT NULL,
    CONSTRAINT fk_ordenes_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    CONSTRAINT fk_ordenes_mesero FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
    CONSTRAINT fk_ordenes_corte FOREIGN KEY (corte_caja_id) REFERENCES cortes_caja(folio) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TABLA DETALLES_ORDEN (Relación N:M entre Ordenes y Productos con ID único para JPA)
CREATE TABLE detalles_orden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    producto_id VARCHAR(36) NOT NULL,
    opcion_id INT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notas VARCHAR(255) NULL,
    completado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_completado DATETIME NULL,
    CONSTRAINT fk_detalles_orden FOREIGN KEY (orden_id) REFERENCES ordenes_comandas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalles_producto FOREIGN KEY (producto_id) REFERENCES productos_menu(id),
    CONSTRAINT fk_detalles_opcion FOREIGN KEY (opcion_id) REFERENCES opciones_producto(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. TABLA TICKETS_COCINA
CREATE TABLE tickets_cocina (
    id VARCHAR(36) PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Nuevas',
    fecha_creacion DATETIME NOT NULL,
    CONSTRAINT fk_tickets_orden FOREIGN KEY (orden_id) REFERENCES ordenes_comandas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
