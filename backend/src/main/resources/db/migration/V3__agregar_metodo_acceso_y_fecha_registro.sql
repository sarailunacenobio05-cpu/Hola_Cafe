ALTER TABLE usuarios
    ADD COLUMN metodo_acceso VARCHAR(30) NOT NULL DEFAULT 'CORREO',
    ADD COLUMN fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE usuarios
    SET metodo_acceso = 'GOOGLE'
    WHERE avatar_url LIKE '%googleusercontent.com%';

UPDATE usuarios
    SET fecha_registro = COALESCE(ultimo_acceso, CURRENT_TIMESTAMP);
