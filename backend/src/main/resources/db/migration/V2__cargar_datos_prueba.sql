-- HOLA CAFÉ - MIGRACIÓN DE DATOS DE PRUEBA V2
-- Pruebas de 10 a 15 registros por tabla principal
-- Contraseñas hasheadas con BCrypt

-- 1. ROLES
INSERT INTO roles (id, nombre) VALUES
(1, 'ROLE_ADMINISTRADOR'),
(2, 'ROLE_MESERO'),
(3, 'ROLE_COCINERO');

-- 2. USUARIOS
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

-- 3. CATEGORIAS_MENU 
INSERT INTO categorias_menu (id, nombre, descripcion) VALUES
(1, 'Alimentos Salados', 'Sabores que te hacen volver: sándwiches, hamburguesas y papas'),
(2, 'Dulces', 'Un final perfecto: crepas y waffles artesanales'),
(3, 'Mini Hotcakes', 'Arma tu combo con base, fruta y topping a elección'),
(4, 'Opciones Frescas', 'Ligeras, nutritivas y deliciosas: ensaladas y tablas de quesos'),
(5, 'Bebidas Calientes (Café)', 'Aromas que despiertan: extracciones de espresso y especialidad'),
(6, 'Opciones Sin Café', 'Relájate, también es un buen plan: chai, matcha y tisanas'),
(7, 'Bebidas Frías', 'Frescura en cada sorbo: frappés, lattes fríos y smoothies');

-- 4. PRODUCTOS_MENU
INSERT INTO productos_menu (id, categoria_id, nombre, descripcion, precio, estado, permite_notas_cocina) VALUES
-- Alimentos Salados
('prod-1', 1, 'Grilled Cheese Artesanal', 'Pan dorado a la plancha con mezcla de quesos fundidos', 110.00, 'DISPONIBLE', 1),
('prod-2', 1, 'Club Sandwich Clásico', 'Pollo a la plancha, tocino, lechuga, jitomate y aderezo especial', 150.00, 'DISPONIBLE', 1),
('prod-3', 1, 'Baguette de Pierna (Especial)', 'Pierna marinada, queso fundido y vegetales frescos', 145.00, 'DISPONIBLE', 1),
('prod-4', 1, 'Hamburguesa Clásica', 'Carne de res, queso, lechuga, jitomate y aderezo en pan artesanal', 165.00, 'DISPONIBLE', 1),
('prod-5', 1, 'Hamburguesa Hawaiana', 'Carne de res, queso, piña asada y jamón', 175.00, 'DISPONIBLE', 1),
('prod-6', 1, 'Hot Dog Gourmet', 'Salchicha premium con toppings a elegir', 95.00, 'DISPONIBLE', 1),
('prod-7', 1, 'Papas Gajo', 'Papas sazonadas, crujientes por fuera y suaves por dentro', 90.00, 'DISPONIBLE', 1),
-- Dulces
('prod-8', 2, 'Crepa Cajeta & Nuez', 'Cajeta artesanal, plátano y nuez tostada', 115.00, 'DISPONIBLE', 1),
('prod-9', 2, 'Crepa Nutella & Frutos Rojos', 'Nutella, fresas y frutos rojos frescos', 120.00, 'DISPONIBLE', 1),
('prod-10', 2, 'Waffle Clásico con Fruta', 'Waffle dorado con fruta de temporada y miel', 105.00, 'DISPONIBLE', 1),
-- Mini Hotcakes
('prod-11', 3, 'Mini Hotcakes (Arma tu combo)', 'Base dulce, fruta fresca y topping crujiente a elegir', 95.00, 'DISPONIBLE', 1),
-- Opciones Frescas
('prod-12', 4, 'Ensalada de Temporada', 'Mezcla de hojas verdes, fruta fresca, nuez y aderezo de la casa', 125.00, 'DISPONIBLE', 1),
('prod-13', 4, 'Tabla de Quesos (Edición Especial)', 'Selección de quesos, frutos, nueces y acompañamientos dulces', 260.00, 'DISPONIBLE', 0),
-- Bebidas Calientes (Café)
('prod-14', 5, 'Espresso', 'Shot concentrado de café de especialidad', 45.00, 'DISPONIBLE', 0),
('prod-15', 5, 'Americano', 'Espresso con agua caliente a 90°C', 50.00, 'DISPONIBLE', 0),
('prod-16', 5, 'Cappuccino', 'Espresso con leche vaporizada y espuma aterciopelada', 70.00, 'DISPONIBLE', 1),
('prod-17', 5, 'Latte Especial', 'Suave mezcla de café y leche cremosa (Vainilla o Caramelo)', 75.00, 'DISPONIBLE', 1),
('prod-18', 5, 'Moka', 'Café con chocolate artesanal y leche vaporizada', 80.00, 'DISPONIBLE', 1),
('prod-19', 5, 'Macchiato', 'Espresso con un suave toque de leche espumada', 55.00, 'DISPONIBLE', 0),
('prod-20', 5, 'Flat White', 'Espresso doble con microespuma densa', 75.00, 'DISPONIBLE', 1),
('prod-21', 5, 'Café de la Casa', 'Mezcla y tueste especial de la casa', 45.00, 'DISPONIBLE', 0),
-- Opciones Sin Café
('prod-22', 6, 'Chai Latte', 'Té negro especiado con canela, cardamomo y leche al vapor', 80.00, 'DISPONIBLE', 1),
('prod-23', 6, 'Matcha Latte', 'Té verde matcha ceremonial japonés batido con leche', 85.00, 'DISPONIBLE', 1),
('prod-24', 6, 'Tisanas Frutales', 'Infusión caliente de frutas deshidratadas naturales', 65.00, 'DISPONIBLE', 0),
-- Bebidas Frías
('prod-25', 7, 'Frappé', 'Bebida cremosa con hielo y café (Cappuccino / Moka / Vainilla)', 85.00, 'DISPONIBLE', 1),
('prod-26', 7, 'Iced Latte', 'Café frío con leche servido sobre cubos de hielo', 75.00, 'DISPONIBLE', 1),
('prod-27', 7, 'Limonada Natural o de Frutos', 'Refrescante limonada natural o con infusión de frutos rojos', 55.00, 'DISPONIBLE', 0),
('prod-28', 7, 'Smoothie', 'Bebida frappé de fruta natural (Mango o Fresa) con agua o yogurt', 75.00, 'DISPONIBLE', 1);

-- 5. OPCIONES_PRODUCTO (Modificadores según la carta)
INSERT INTO opciones_producto (id, producto_id, nombre, precio_extra) VALUES
-- Opciones de leche para café caliente
(1, 'prod-17', 'Leche Entera', 0.00),
(2, 'prod-17', 'Leche Deslactosada', 0.00),
(3, 'prod-17', 'Leche de Almendra', 15.00),
(4, 'prod-17', 'Leche de Avena', 15.00),
(5, 'prod-17', 'Sabor Vainilla', 10.00),
(6, 'prod-17', 'Sabor Caramelo', 10.00),
-- Opciones para Frappé
(7, 'prod-25', 'Sabor Cappuccino', 0.00),
(8, 'prod-25', 'Sabor Moka', 0.00),
(9, 'prod-25', 'Sabor Vainilla', 0.00),
-- Opciones para Limonadas
(10, 'prod-27', 'Natural', 0.00),
(11, 'prod-27', 'De Frutos Rojos', 10.00),
-- Opciones para Smoothies
(12, 'prod-28', 'Mango con agua', 0.00),
(13, 'prod-28', 'Fresa con agua', 0.00),
(14, 'prod-28', 'Con Yogurt griego', 15.00),
-- Bases para Mini Hotcakes
(15, 'prod-11', 'Base Nutella', 0.00),
(16, 'prod-11', 'Base Cajeta', 0.00),
(17, 'prod-11', 'Base Lechera', 0.00);

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

-- 7. BOTONES 
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
INSERT INTO ordenes_comandas (id, folio, mesa_id, mesero_id, corte_caja_id, estado, subtotal, descuento_porcentaje, propina, total, metodo_pago, monto_pagado, cambio, telefono, revisado, fecha) VALUES
('ord-101', 1035, 'M01', 'u-1', NULL, 'Enviada', 260.00, 0.00, 26.00, 286.00, NULL, NULL, NULL, '+525512345678', 0, NOW()),
('ord-102', 1037, 'M02', 'u-2', NULL, 'En preparación', 320.00, 0.00, 32.00, 352.00, NULL, NULL, NULL, NULL, 0, NOW()),
('ord-104', 1039, 'M04', 'u-2', NULL, 'Por Cobrar', 570.00, 10.00, 51.30, 564.30, 'Terminal Bancaria', 564.30, 0.00, '+525598765432', 1, NOW()),
('ord-105', 1040, 'M05', 'u-4', NULL, 'Lista', 645.00, 0.00, 64.50, 709.50, NULL, NULL, NULL, NULL, 0, NOW());

-- 11. DETALLES_ORDEN
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

-- 12. TICKETS_COCINA 
INSERT INTO tickets_cocina (id, orden_id, estado, fecha_creacion) VALUES
('k-1', 'ord-102', 'En preparación', NOW()),
('k-2', 'ord-105', 'Listas', NOW());
