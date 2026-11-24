-- HOLA CAFÉ - MIGRACIÓN V3
-- Actualiza el hash BCrypt de los usuarios de prueba para que corresponda a: HolaCafe#2026
UPDATE usuarios
SET password_hash = '$2a$10$wg5RZl/5f4ZCBPE84Mh4De8tBDVKFGv4fuHW/Ii4mTUWwLCxNyrvW'
WHERE password_hash = '$2a$10$7EqJtq98hPqEX7fNZaFWoO2W.RjM8jH9c5u1JjL7Iiqf2dJtB4Fey';
