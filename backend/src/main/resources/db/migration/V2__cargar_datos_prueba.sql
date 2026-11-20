-- HOLA CAFÉ - MIGRACIÓN DE DATOS DE PRUEBA V2
-- Mínimo 10 a 15 registros por tabla principal
-- Contraseñas hasheadas con BCrypt (Contraseña de prueba: HolaCafe#2026)

-- 1. ROLES (5 roles del sistema)
INSERT INTO roles (id, nombre) VALUES
(1, 'ROLE_ADMINISTRADOR'),
(2, 'ROLE_MESERO'),
(3, 'ROLE_COCINERO'),
(4, 'ROLE_CAJERO'),
(5, 'ROLE_CLIENTE');

-- 2. USUARIOS (11 usuarios: 1 Admin de evaluación, 2 meseros, 2 cocineros, 1 cajera, 1 cliente)
INSERT INTO usuarios (id, rol_id, nombre, correo, password_hash, estado, ultimo_acceso, avatar_url) VALUES
('u-admin', 1, 'Dante M.', 'admin@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), '/img/admin-avatar.jpg'),
('u-1', 2, 'David Huerta', 'dhuerta@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-2', 2, 'Gael Ortiz', 'gortiz@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-3', 2, 'Santiago Martinez', 'smartinez@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-4', 2, 'Sarai Luna', 'sluna@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-5', 2, 'Melissa Huerta', 'mhuerta@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-6', 2, 'Carlos Ramirez', 'cramirez@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'BAJA', NOW(), NULL),
('u-cook1', 3, 'Rodrigo Gomez', 'cocina@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-cook2', 3, 'Ana Morales', 'amorales@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-caja1', 4, 'Patricia Vega', 'caja@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL),
('u-client1', 5, 'Cliente Frecuente', 'cliente@holacafe.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey', 'ACTIVO', NOW(), NULL);

-- 3. CATEGORIAS_MENU (6 categorías)
INSERT INTO categorias_menu (id, nombre, descripcion) VALUES
(1, 'Cafetería Especialidad', 'Extracciones de espresso, tueste medio y café artesanal'),
(2, 'Bebidas calientes', 'Tés, lattes e infusiones vaporizadas'),
(3, 'Bebidas frías', 'Frappés, sodas italianas y cold brew con hielo'),
(4, 'Alimentos salados', 'Sándwiches, hamburguesas y papas artesanales'),
(5, 'Desayunos', 'Chilaquiles de la casa, huevos y omelettes'),
(6, 'Repostería y Pan', 'Panadería de masa madre y repostería francesa recién horneada');

-- 4. PRODUCTOS_MENU
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

-- 5. OPCIONES_PRODUCTO (Variantes y modificadores)
INSERT INTO opciones_producto (id, producto_id, nombre, precio_extra) VALUES
(1, 'prod-6', 'Leche Entera', 0.00),
(2, 'prod-6', 'Leche Deslactosada', 0.00),
(3, 'prod-6', 'Leche de Almendra', 15.00),
(4, 'prod-6', 'Leche de Avena', 15.00),
(5, 'prod-7', 'Vainilla', 0.00),
(6, 'prod-7', 'Caramelo', 10.00),
(7, 'prod-8', 'Natural', 0.00),
(8, 'prod-8', 'Con vainilla', 10.00);

-- 6. MESAS
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
-- 7. DISPOSITIVOS_IOT 
INSERT INTO dispositivos_iot (id, nombre, mesa_id, bateria, estado) VALUES
('BOT-M01', 'Botón de Mesa 01', 'M01', 92, 'En línea'),
('BOT-M02', 'Botón de Mesa 02', 'M02', 98, 'En línea'),
('BOT-M03', 'Botón de Mesa 03', 'M03', 85, 'En línea'),
('BOT-M04', 'Botón de Mesa 04', 'M04', 88, 'En línea'),
('BOT-M05', 'Botón de Mesa 05', 'M05', 91, 'En línea'),
('BOT-M06', 'Botón de Mesa 06', 'M06', 73, 'Sin conexión'),
('BOT-M07', 'Botón de Mesa 07', 'M07', 18, 'Batería baja'),
('BOT-M08', 'Botón de Mesa 08', 'M08', 24, 'Batería baja'),
('BOT-M09', 'Botón de Mesa 09', 'M09', 8, 'Batería crítica');
-- 8. ALERTAS ACTIVAS
INSERT INTO alertas (id, dispositivo_id, mesa_id, usuario_id, estado) VALUES
(1, 'BOT-M04', 'M04', 'u-2', 1),
(2, 'BOT-M07', 'M07', 'u-5', 1);

-- 9. CORTES_CAJA
INSERT INTO cortes_caja (folio, responsable_id, total_ventas, monto_efectivo, monto_tarjeta, monto_transferencia_qr, total_tickets, observaciones, fecha) VALUES
('CORTE-2026-1102', 'u-admin', 21400.00, 8900.00, 12500.00, 0.00, 58, 'Cuadre exacto sin incidencias', '2026-11-02 22:40:00'),
('CORTE-2026-1103', 'u-admin', 14210.00, 5100.00, 9110.00, 0.00, 36, 'Turno matutino y vespertino', '2026-11-03 22:20:00'),
('CORTE-2026-1104', 'u-admin', 19350.00, 7850.00, 11500.00, 0.00, 51, 'Diferencia de -$50 en moneda suelta', '2026-11-04 22:15:00'),
('CORTE-2026-1105', 'u-admin', 16840.00, 6420.00, 10420.00, 0.00, 42, 'Cierre sin diferencias', '2026-11-05 22:30:00');

-- 10. ORDENES_COMANDAS
INSERT INTO ordenes_comandas (id, folio, mesa_id, mesero_id, corte_caja_id, estado, subtotal, descuento_porcentaje, propina, total, metodo_pago, monto_pagado, cambio, telefono, fecha) VALUES
('ord-101', 1035, 'M01', 'u-1', NULL, 'Enviada', 260.00, 0.00, 26.00, 286.00, NULL, NULL, NULL, '+525512345678', NOW()),
('ord-102', 1037, 'M02', 'u-2', NULL, 'En preparación', 360.00, 0.00, 36.00, 396.00, NULL, NULL, NULL, NULL, NOW()),
('ord-104', 1039, 'M04', 'u-2', NULL, 'Por Cobrar', 980.00, 10.00, 88.20, 970.20, 'Terminal Bancaria', 970.20, 0.00, '+525598765432', NOW()),
('ord-105', 1040, 'M05', 'u-4', NULL, 'Lista', 585.00, 0.00, 58.50, 643.50, NULL, NULL, NULL, NULL, NOW());

-- 11. DETALLES_ORDEN
INSERT INTO detalles_orden (id, orden_id, producto_id, opcion_id, cantidad, precio_unitario, subtotal, notas, completado) VALUES
(1, 'ord-101', 'prod-6', 4, 2, 75.00, 150.00, 'Leche de avena bien espumada', 1),
(2, 'ord-101', 'prod-11', NULL, 2, 55.00, 110.00, 'Tibios con mermelada', 1),
(3, 'ord-102', 'prod-13', NULL, 2, 135.00, 270.00, 'Sin cebolla, salsa bien caliente', 0),
(4, 'ord-102', 'prod-9', NULL, 2, 45.00, 90.00, 'Con agua muy caliente', 1),
(5, 'ord-104', 'prod-3', NULL, 2, 165.00, 330.00, 'Término medio', 1),
(6, 'ord-104', 'prod-5', NULL, 2, 95.00, 190.00, 'Extra crujientes', 1),
(7, 'ord-104', 'prod-7', 5, 2, 85.00, 170.00, 'Con crema batida', 1),
(8, 'ord-105', 'prod-1', NULL, 3, 110.00, 330.00, 'Bien dorados', 1),
(9, 'ord-105', 'prod-7', 6, 3, 85.00, 255.00, 'Con extra caramelo', 1);

-- 12. TICKETS_COCINA 
INSERT INTO tickets_cocina (id, orden_id, estado, fecha_creacion) VALUES
('k-1', 'ord-102', 'En preparación', NOW()),
('k-2', 'ord-105', 'Listas', NOW());
