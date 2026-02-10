USE cooperativa_cuentas;

-- Más datos de prueba para simulaciones
INSERT IGNORE INTO cuentas (id, socio_id, numero_cuentas, saldo, estado, tipo_cuenta, activo) VALUES
('550e8400-e29b-41d4-a716-446655440100', '00000000-0000-0000-0000-000000000000', '001-999999999', 1000.00, 'ACTIVA', 'AHORRO', 1),
('550e8400-e29b-41d4-a716-446655440101', '11111111-1111-1111-1111-111111111111', '001-888888888', 5000.00, 'ACTIVA', 'CORRIENTE', 1),
('550e8400-e29b-41d4-a716-446655440102', '22222222-2222-2222-2222-222222222222', '001-777777777', 2000.00, 'CANCELADA', 'AHORRO', 0),
('550e8400-e29b-41d4-a716-446655440103', '33333333-3333-3333-3333-333333333333', '001-666666666', 0.00, 'SUSPENDIDA', 'CORRIENTE', 1),
('550e8400-e29b-41d4-a716-446655440104', '44444444-4444-4444-4444-444444444444', '001-555555555', -500.00, 'ACTIVA', 'AHORRO', 1); -- Saldo negativo para pruebas

-- Procedimiento almacenado para limpieza de pruebas
DELIMITER $$
CREATE PROCEDURE limpiar_datos_prueba()
BEGIN
    DELETE FROM auditoria_cuentas WHERE fecha < DATE_SUB(NOW(), INTERVAL 7 DAY);
    UPDATE cuentas SET activo = 0 WHERE saldo < 0 AND estado = 'ACTIVA';
END$$
DELIMITER ;

-- Vista para reportes
CREATE OR REPLACE VIEW vista_cuentas_activas AS
SELECT 
    c.id,
    c.socio_id,
    c.numero_cuenta,
    c.saldo,
    c.estado,
    c.tipo_cuenta,
    c.fecha_creacion,
    COUNT(a.id) as total_auditorias
FROM cuentas c
LEFT JOIN auditoria_cuentas a ON c.id = a.cuenta_id
WHERE c.activo = 1
GROUP BY c.id;