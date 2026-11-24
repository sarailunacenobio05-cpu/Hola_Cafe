respaldo_holacafe.sql

-- HOLA CAFÉ - RESPALDO COMPLETO DE BASE DE DATOS (MYSQL DUMP)
-- Incluye DDL y DML.

CREATE DATABASE IF NOT EXISTS holacafe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE holacafe_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS tickets_cocina;
DROP TABLE IF EXISTS detalles_orden;
DROP TABLE IF EXISTS ordenes_comandas;
DROP TABLE IF EXISTS opciones_producto;
DROP TABLE IF EXISTS productos_menu;
DROP TABLE IF EXISTS categorias_menu;
DROP TABLE IF EXISTS alertas;
DROP TABLE IF EXISTS botones;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS cortes_caja;
DROP TABLE IF EXISTS tokens_revocados;
DROP TABLE IF EXISTS tokens_recuperacion;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

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

-- 4. TABLA TOKENS_REVOCADOS
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

-- 7. TABLA BOTONES
CREATE TABLE botones (
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
    CONSTRAINT fk_alertas_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES botones(id) ON DELETE CASCADE,
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
    revisado TINYINT(1) NOT NULL DEFAULT 0,
    fecha DATETIME NOT NULL,
    CONSTRAINT fk_ordenes_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    CONSTRAINT fk_ordenes_mesero FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
    CONSTRAINT fk_ordenes_corte FOREIGN KEY (corte_caja_id) REFERENCES cortes_caja(folio) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TABLA DETALLES_ORDEN
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

-- CARGA DE DATOS SEMILLA
INSERT INTO roles (id, nombre) VALUES
(1, 'ROLE_ADMINISTRADOR'),
(2, 'ROLE_MESERO'),
(3, 'ROLE_COCINERO');

INSERT INTO usuarios (id, rol_id, nombre, correo, password_hash, estado, ultimo_acceso, avatar_url) VALUES
('u-admin', 1, 'Dante Martínez', 'admin@holacafe.com', '$2a$10$wg5RZl/5f4ZCBPE84Mh4De8tBDVKFGv4fuHW/Ii4mTUWwLCxNyrvW', 'ACTIVO', NOW(), '/img/admin-avatar.jpg'),
('u-1', 2, 'David Huerta', 'dhuerta@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-2', 2, 'Gael Ortiz', 'gortiz@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-3', 2, 'Santiago Martinez', 'smartinez@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-4', 2, 'Sarai Luna', 'sluna@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-5', 2, 'Melissa Huerta', 'mhuerta@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-6', 2, 'Osmar David', 'odavid@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'BAJA', NOW(), NULL),
('u-7', 2, 'Cinthya Huerta', 'chuerta@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-cook1', 3, 'Luis Angel', 'cocina@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL),
('u-cook2', 3, 'Susi Suyali', 'ssuyali@holacafe.com', '$2a$10$/P7gYQAIUY6P4cs16uL8eu/0rfdOud1jW9pcwdhHlrud9UEVmTzTm', 'ACTIVO', NOW(), NULL);

INSERT INTO categorias_menu (id, nombre, descripcion) VALUES
(1, 'Cafetería Especialidad', 'Extracciones de espresso, tueste medio y café artesanal'),
(2, 'Bebidas calientes', 'Tés, lattes e infusiones vaporizadas'),
(3, 'Bebidas frías', 'Frappés, sodas italianas y cold brew con hielo'),
(4, 'Alimentos salados', 'Sándwiches, hamburguesas y papas artesanales'),
(5, 'Desayunos', 'Chilaquiles de la casa, huevos y omelettes'),
(6, 'Repostería y Pan', 'Panadería de masa madre y repostería francesa recién horneada');

INSERT INTO productos_menu (id, categoria_id, nombre, descripcion, precio, estado, permite_notas_cocina) VALUES
('prod-1', 4, 'Grilled Cheese Artesanal', 'Pan dorado con mezcla de quesos fundidos', 110.00, 'DISPONIBLE', 1),
('prod-2', 4, 'Club Sandwich Clásico', 'Pollo, tocino, lechuga, jitomate y aderezo', 150.00, 'DISPONIBLE', 1),
('prod-3', 4, 'Hamburguesa Clásica', 'Carne de res, queso, lechuga y jitomate', 165.00, 'DISPONIBLE', 1),
('prod-4', 4, 'Hamburguesa Hawaiana', 'Carne de res, queso, piña asada y jamón', 175.00, 'DISPONIBLE', 1),
('prod-5', 4, 'Papas Gajo', 'Papas sazonadas, crujientes por fuera', 95.00, 'DISPONIBLE', 1),
('prod-6', 2, 'Latte Especial', 'Espresso doble con microespuma de leche al vapor', 75.00, 'DISPONIBLE', 1),
('prod-7', 3, 'Frappé Moka', 'Café batido con hielo, chocolate y crema batida', 85.00, 'DISPONIBLE', 1),
('prod-8', 3, 'Cold Brew Clásico', 'Extracción en frío por 18 hrs, suave y refrescante', 70.00, 'DISPONIBLE', 1),
('prod-9', 1, 'Americano Especial', 'Espresso diluido con agua purificada a 90°C', 45.00, 'DISPONIBLE', 1),
('prod-10', 1, 'Cappuccino Italiano', 'Espresso con microespuma densa y toque de cacao', 75.00, 'DISPONIBLE', 1),
('prod-11', 6, 'Croissant de Mantequilla', 'Hojaldre francés recién horneado con mantequilla pura', 55.00, 'DISPONIBLE', 0),
('prod-12', 6, 'Rol de Canela Glaseado', 'Esponjoso rol con canela y glaseado de queso crema', 60.00, 'DISPONIBLE', 0),
('prod-13', 5, 'Chilaquiles Rojos con Pollo', 'Totopos en salsa roja con pollo deshebrado, crema y queso', 135.00, 'DISPONIBLE', 1),
('prod-14', 5, 'Omelette Suizo', 'Huevos de granja rellenos de queso gouda y jamón', 115.00, 'DISPONIBLE', 1),
('prod-15', 3, 'Soda Italiana Maracuyá', 'Agua gasificada artesanal con pulpa de fruta de la pasión', 65.00, 'DISPONIBLE', 0);

INSERT INTO opciones_producto (id, producto_id, nombre, precio_extra) VALUES
(1, 'prod-6', 'Leche Entera', 0.00),
(2, 'prod-6', 'Leche Deslactosada', 0.00),
(3, 'prod-6', 'Leche de Almendra', 15.00),
(4, 'prod-6', 'Leche de Avena', 15.00),
(5, 'prod-7', 'Vainilla', 0.00),
(6, 'prod-7', 'Caramelo', 10.00),
(7, 'prod-8', 'Natural', 0.00),
(8, 'prod-8', 'Con vainilla', 10.00);

INSERT INTO mesas (id, numero, capacidad, estado, mesero_id) VALUES
('M01', 1, 2, 'Atendido', 'u-1'),
('M02', 2, 4, 'En Preparación', 'u-2'),
('M03', 3, 2, 'Limpia / Disponible', 'u-3'),
('M04', 4, 4, 'Pidiendo Cuenta', 'u-2'),
('M05', 5, 6, 'En Consumo', 'u-4'),
('M06', 6, 2, 'En Consumo', 'u-1'),
('M07', 7, 4, 'Atendido', 'u-5'),
('M08', 8, 4, 'Reservada', 'u-3'),
('M09', 9, 8, 'En Preparación', 'u-4');

INSERT INTO botones (id, nombre, mesa_id, bateria, estado) VALUES
('BOT-M01', 'Botón de Mesa 01', 'M01', 92, 'En línea'),
('BOT-M02', 'Botón de Mesa 02', 'M02', 98, 'En línea'),
('BOT-M03', 'Botón de Mesa 03', 'M03', 85, 'En línea'),
('BOT-M04', 'Botón de Mesa 04', 'M04', 88, 'En línea'),
('BOT-M05', 'Botón de Mesa 05', 'M05', 91, 'En línea'),
('BOT-M06', 'Botón de Mesa 06', 'M06', 73, 'Sin conexión'),
('BOT-M07', 'Botón de Mesa 07', 'M07', 18, 'Batería baja'),
('BOT-M08', 'Botón de Mesa 08', 'M08', 24, 'Batería baja'),
('BOT-M09', 'Botón de Mesa 09', 'M09', 8, 'Batería crítica');

INSERT INTO alertas (id, dispositivo_id, mesa_id, usuario_id, estado) VALUES
(1, 'BOT-M04', 'M04', 'u-2', 1),
(2, 'BOT-M07', 'M07', 'u-5', 1);

INSERT INTO cortes_caja (folio, responsable_id, total_ventas, monto_efectivo, monto_tarjeta, monto_transferencia_qr, total_tickets, observaciones, fecha) VALUES
('CORTE-2026-1102', 'u-admin', 21400.00, 8900.00, 12500.00, 0.00, 58, 'Cuadre exacto sin incidencias', '2026-11-02 22:40:00'),
('CORTE-2026-1103', 'u-admin', 14210.00, 5100.00, 9110.00, 0.00, 36, 'Turno matutino y vespertino', '2026-11-03 22:20:00'),
('CORTE-2026-1104', 'u-admin', 19350.00, 7850.00, 11500.00, 0.00, 51, 'Diferencia de -$50 en moneda suelta', '2026-11-04 22:15:00'),
('CORTE-2026-1105', 'u-admin', 16840.00, 6420.00, 10420.00, 0.00, 42, 'Cierre sin diferencias', '2026-11-05 22:30:00');

INSERT INTO ordenes_comandas (id, folio, mesa_id, mesero_id, corte_caja_id, estado, subtotal, descuento_porcentaje, propina, total, metodo_pago, monto_pagado, cambio, telefono, revisado, fecha) VALUES
('ord-101', 1035, 'M01', 'u-1', NULL, 'Enviada', 260.00, 0.00, 26.00, 286.00, NULL, NULL, NULL, '+525512345678', 0, NOW()),
('ord-102', 1037, 'M02', 'u-2', NULL, 'En preparación', 320.00, 0.00, 32.00, 352.00, NULL, NULL, NULL, NULL, 0, NOW()),
('ord-104', 1039, 'M04', 'u-2', NULL, 'Por Cobrar', 570.00, 10.00, 51.30, 564.30, 'Terminal Bancaria', 564.30, 0.00, '+525598765432', 1, NOW()),
('ord-105', 1040, 'M05', 'u-4', NULL, 'Lista', 645.00, 0.00, 64.50, 709.50, NULL, NULL, NULL, NULL, 0, NOW());

INSERT INTO detalles_orden (id, orden_id, producto_id, opcion_id, cantidad, precio_unitario, subtotal, notas, completado) VALUES
(1, 'ord-101', 'prod-17', 4, 2, 75.00, 150.00, 'Con leche de avena', 1),
(2, 'ord-101', 'prod-10', NULL, 2, 105.00, 210.00, 'Fruta bien picada', 1),
(3, 'ord-102', 'prod-1', NULL, 2, 110.00, 220.00, 'Pan bien dorado', 0),
(4, 'ord-102', 'prod-15', NULL, 2, 50.00, 100.00, 'Agua muy caliente', 1),
(5, 'ord-104', 'prod-4', NULL, 2, 165.00, 330.00, 'Carne término medio', 1),
(6, 'ord-104', 'prod-7', NULL, 2, 90.00, 180.00, 'Papas extra crujientes', 1),
(7, 'ord-104', 'prod-25', 8, 2, 85.00, 170.00, 'Frappé Moka con crema', 1),
(8, 'ord-105', 'prod-2', NULL, 3, 150.00, 450.00, 'Sin jitomate', 1),
(9, 'ord-105', 'prod-27', 11, 3, 65.00, 195.00, 'De frutos rojos bien fría', 1);

INSERT INTO tickets_cocina (id, orden_id, estado, fecha_creacion) VALUES
('k-1', 'ord-102', 'En preparación', NOW()),
('k-2', 'ord-105', 'Listas', NOW());