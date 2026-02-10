-- Crear usuario adicional con privilegios específicos
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'AppUser123!';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON cooperativa_cuentas.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Configuraciones adicionales
SET GLOBAL max_connections = 1000;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;

-- Crear tabla de cuentas si no existe
USE cooperativa_cuentas;

CREATE TABLE IF NOT EXISTS cuentas (
    id VARCHAR(36) PRIMARY KEY,
    socio_id VARCHAR(36) NOT NULL,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    estado ENUM('ACTIVA', 'SUSPENDIDA', 'CANCELADA') DEFAULT 'ACTIVA',
    tipo_cuenta VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    INDEX idx_cuentas_socio_id (socio_id),
    INDEX idx_cuentas_numero (numero_cuenta),
    INDEX idx_cuentas_activo (activo),
    INDEX idx_cuentas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba
INSERT IGNORE INTO cuentas (id, socio_id, numero_cuentas, saldo, estado, tipo_cuenta) VALUES
('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', '001-100000001', 5000.00, 'ACTIVA', 'AHORRO'),
('550e8400-e29b-41d4-a716-446655440001', '123e4567-e89b-12d3-a456-426614174001', '001-100000002', 15000.00, 'ACTIVA', 'CORRIENTE'),
('550e8400-e29b-41d4-a716-446655440002', '123e4567-e89b-12d3-a456-426614174002', '001-100000003', 2500.00, 'SUSPENDIDA', 'AHORRO'),
('550e8400-e29b-41d4-a716-446655440003', '123e4567-e89b-12d3-a456-426614174000', '001-100000004', 10000.00, 'ACTIVA', 'PLAZO_FIJO');

-- Crear tabla de auditoría para pruebas
CREATE TABLE IF NOT EXISTS auditoria_cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id VARCHAR(36),
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    usuario VARCHAR(100),
    ip_address VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger de ejemplo para auditoría (opcional)
DELIMITER $$
CREATE TRIGGER after_cuenta_update
AFTER UPDATE ON cuentas
FOR EACH ROW
BEGIN
    IF OLD.saldo != NEW.saldo THEN
        INSERT INTO auditoria_cuentas (cuenta_id, accion, descripcion)
        VALUES (NEW.id, 'ACTUALIZACION_SALDO', 
                CONCAT('Saldo actualizado de ', OLD.saldo, ' a ', NEW.saldo));
    END IF;
    
    IF OLD.estado != NEW.estado THEN
        INSERT INTO auditoria_cuentas (cuenta_id, accion, descripcion)
        VALUES (NEW.id, 'CAMBIO_ESTADO', 
                CONCAT('Estado cambiado de ', OLD.estado, ' a ', NEW.estado));
    END IF;
END$$
DELIMITER ;