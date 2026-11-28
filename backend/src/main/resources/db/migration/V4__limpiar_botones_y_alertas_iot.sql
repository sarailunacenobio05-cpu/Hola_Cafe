ALTER TABLE alertas
    ADD COLUMN fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE alertas SET estado = 0 WHERE estado = 1;
DELETE FROM alertas WHERE dispositivo_id <> 'BOT-M03';
DELETE FROM botones WHERE id <> 'BOT-M03';
UPDATE botones SET nombre = 'Botón de Mesa 03', mesa_id = 'M03', estado = 'En línea' WHERE id = 'BOT-M03';
