/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentasService } from '../cuentas.service';
import { Cuenta } from '../entities/cuenta.entity';
import { SociosClientService } from '../services/socios-client.service';
import { NotFoundException, ConflictException, HttpException } from '@nestjs/common';
import { CuentaRequestDto } from '../dto/cuenta-request.dto';

describe('CuentasService - Pruebas Unitarias Completas', () => {
  let service: CuentasService;
  let repository: Repository<Cuenta>;
  let sociosClient: SociosClientService;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSociosClient = {
    validarSocioExiste: jest.fn(),
    socioTieneCuentasActivas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentasService,
        {
          provide: getRepositoryToken(Cuenta),
          useValue: mockRepository,
        },
        {
          provide: SociosClientService,
          useValue: mockSociosClient,
        },
      ],
    }).compile();

    service = module.get<CuentasService>(CuentasService);
    repository = module.get<Repository<Cuenta>>(getRepositoryToken(Cuenta));
    sociosClient = module.get<SociosClientService>(SociosClientService);

    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('✅ Validaciones Cross-Service', () => {
    it('debe validar que el socio existe antes de crear una cuenta', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockResolvedValue({
        id: 'socio-123',
        identificacion: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      });

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(request as any);
      mockRepository.save.mockResolvedValue({
        id: 'cuenta-1',
        ...request,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      await service.crearCuenta(request);

      expect(sociosClient.validarSocioExiste).toHaveBeenCalledWith('socio-123');
      expect(sociosClient.validarSocioExiste).toHaveBeenCalledTimes(1);
    });

    it('debe rechazar crear cuenta si el socio no existe', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-inexistente',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockRejectedValue(
        new HttpException('El socio especificado no existe', 400)
      );

      await expect(service.crearCuenta(request)).rejects.toThrow('El socio especificado no existe');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debe rechazar crear cuenta si el socio no está activo', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-inactivo',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockRejectedValue(
        new HttpException('El socio no está activo', 400)
      );

      await expect(service.crearCuenta(request)).rejects.toThrow('El socio no está activo');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('🔒 Pruebas de Concurrencia', () => {
    it('debe detectar número de cuenta duplicado en operaciones concurrentes', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockResolvedValue({ activo: true });
      mockRepository.findOne.mockResolvedValue({
        id: 'cuenta-existente',
        numeroCuenta: '1234567890',
        activo: true,
      });

      await expect(service.crearCuenta(request)).rejects.toThrow(ConflictException);
    });

    it('debe manejar múltiples retiros concurrentes sin generar saldo negativo', async () => {
      const cuentaId = 'cuenta-1';
      const saldoInicial = 1000;

      const cuenta = {
        id: cuentaId,
        saldo: saldoInicial,
        estado: 'ACTIVA',
        activo: true,
      };

      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockImplementation((cuenta) => Promise.resolve(cuenta));

      // Simular retiro que deja el saldo en 0
      await service.realizarRetiro(cuentaId, 500);
      cuenta.saldo = 500;

      // Intentar otro retiro que excede el saldo
      await expect(service.realizarRetiro(cuentaId, 600)).rejects.toThrow(ConflictException);
    });
  });

  describe('⚡ Pruebas de Resiliencia', () => {
    it('debe manejar fallo del servicio de socios con mensaje apropiado', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockRejectedValue(
        new HttpException('No se pudo validar la existencia del socio. El servicio de socios no está disponible', 503)
      );

      await expect(service.crearCuenta(request)).rejects.toThrow(
        'No se pudo validar la existencia del socio. El servicio de socios no está disponible'
      );
    });

    it('debe continuar operando si el servicio de socios responde lentamente', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      // Simular respuesta lenta (200ms)
      mockSociosClient.validarSocioExiste.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ activo: true }), 200))
      );

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(request as any);
      mockRepository.save.mockResolvedValue({
        id: 'cuenta-1',
        ...request,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      const inicio = Date.now();
      await service.crearCuenta(request);
      const duracion = Date.now() - inicio;

      expect(duracion).toBeGreaterThanOrEqual(200);
      expect(sociosClient.validarSocioExiste).toHaveBeenCalled();
    });
  });

  describe('🔄 Pruebas de Idempotencia', () => {
    it('múltiples llamadas para crear la misma cuenta deben fallar después de la primera', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockResolvedValue({ activo: true });

      // Primera llamada: éxito
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(request as any);
      mockRepository.save.mockResolvedValue({
        id: 'cuenta-1',
        ...request,
        estado: 'ACTIVA',
        activo: true,
      });

      await service.crearCuenta(request);

      // Segunda llamada: debe fallar
      mockRepository.findOne.mockResolvedValueOnce({
        id: 'cuenta-1',
        numeroCuenta: '1234567890',
        activo: true,
      });

      await expect(service.crearCuenta(request)).rejects.toThrow(ConflictException);
    });

    it('múltiples depósitos del mismo monto deben aplicarse individualmente', async () => {
      const cuentaId = 'cuenta-1';
      const montoDeposito = 100;

      const cuenta = {
        id: cuentaId,
        saldo: 1000,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockImplementation((cuenta) => Promise.resolve(cuenta));

      await service.realizarDeposito(cuentaId, montoDeposito);
      expect(cuenta.saldo).toBe(1100);

      await service.realizarDeposito(cuentaId, montoDeposito);
      expect(cuenta.saldo).toBe(1200);
    });
  });

  describe('💰 Validaciones de Negocio', () => {
    it('debe rechazar retiros que excedan el saldo disponible', async () => {
      const cuentaId = 'cuenta-1';

      mockRepository.findOne.mockResolvedValue({
        id: cuentaId,
        saldo: 100,
        estado: 'ACTIVA',
        activo: true,
      });

      await expect(service.realizarRetiro(cuentaId, 150)).rejects.toThrow('Saldo insuficiente');
    });

    it('debe rechazar operaciones en cuentas canceladas', async () => {
      const cuentaId = 'cuenta-1';

      mockRepository.findOne.mockResolvedValue({
        id: cuentaId,
        saldo: 1000,
        estado: 'CANCELADA',
        activo: true,
      });

      await expect(service.realizarDeposito(cuentaId, 100)).rejects.toThrow('La cuenta no está activa');
      await expect(service.realizarRetiro(cuentaId, 100)).rejects.toThrow('La cuenta no está activa');
    });

    it('debe permitir obtener todas las cuentas de un socio', async () => {
      const socioId = 'socio-123';

      mockRepository.find.mockResolvedValue([
        {
          id: 'cuenta-1',
          socioId,
          numeroCuenta: '1234567890',
          saldo: 1000,
          estado: 'ACTIVA',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        {
          id: 'cuenta-2',
          socioId,
          numeroCuenta: '0987654321',
          saldo: 2000,
          estado: 'ACTIVA',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ]);

      const cuentas = await service.obtenerCuentasPorSocio(socioId);

      expect(cuentas).toHaveLength(2);
      expect(cuentas[0].socioId).toBe(socioId);
      expect(cuentas[1].socioId).toBe(socioId);
    });
  });

  describe('🧪 Operaciones y Consultas', () => {
    it('debe actualizar una cuenta existente', async () => {
      const cuentaId = 'cuenta-1';
      const request: CuentaRequestDto = {
        socioId: 'socio-999',
        numeroCuenta: '002-333444555',
        saldo: 500,
        tipoCuenta: 'CORRIENTE',
      };

      const cuentaActual = {
        id: cuentaId,
        socioId: 'socio-123',
        numeroCuenta: '001-111222333',
        saldo: 1000,
        tipoCuenta: 'AHORRO',
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      mockRepository.findOne
        .mockResolvedValueOnce(cuentaActual)
        .mockResolvedValueOnce(null);

      mockRepository.save.mockResolvedValue({
        ...cuentaActual,
        socioId: request.socioId,
        numeroCuenta: request.numeroCuenta,
        tipoCuenta: request.tipoCuenta,
      });

      const resultado = await service.actualizarCuenta(cuentaId, request);

      expect(resultado.id).toBe(cuentaId);
      expect(resultado.numeroCuenta).toBe(request.numeroCuenta);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe rechazar retiro con monto invalido', async () => {
      await expect(service.realizarRetiro('cuenta-1', 0)).rejects.toThrow('Monto inválido');
      await expect(service.realizarRetiro('cuenta-1', -10)).rejects.toThrow('Monto inválido');
    });

    it('debe rechazar deposito con monto invalido', async () => {
      await expect(service.realizarDeposito('cuenta-1', 0)).rejects.toThrow('Monto inválido');
      await expect(service.realizarDeposito('cuenta-1', -5)).rejects.toThrow('Monto inválido');
    });

    it('debe fallar si el saldo actual es invalido en deposito', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 'cuenta-1',
        saldo: 'abc',
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      await expect(service.realizarDeposito('cuenta-1', 100)).rejects.toThrow('Saldo inválido');
    });

    it('debe fallar si el saldo actual es invalido en retiro', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 'cuenta-1',
        saldo: 'xyz',
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      await expect(service.realizarRetiro('cuenta-1', 100)).rejects.toThrow('Saldo inválido');
    });

    it('debe rechazar actualización si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.actualizarCuenta('cuenta-inexistente', {
          socioId: 'socio-1',
          numeroCuenta: '001-111222333',
          saldo: 0,
          tipoCuenta: 'AHORRO',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('debe rechazar actualización si el nuevo número está en uso', async () => {
      const cuentaId = 'cuenta-1';
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '001-111222333',
        saldo: 0,
        tipoCuenta: 'AHORRO',
      };

      mockRepository.findOne
        .mockResolvedValueOnce({ id: cuentaId, numeroCuenta: '999-000000111', activo: true })
        .mockResolvedValueOnce({ id: 'cuenta-2', numeroCuenta: request.numeroCuenta, activo: true });

      await expect(service.actualizarCuenta(cuentaId, request)).rejects.toThrow(ConflictException);
    });

    it('debe obtener una cuenta existente', async () => {
      const cuentaId = 'cuenta-1';

      mockRepository.findOne.mockResolvedValue({
        id: cuentaId,
        socioId: 'socio-123',
        numeroCuenta: '001-111222333',
        saldo: 1000,
        tipoCuenta: 'AHORRO',
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      const cuenta = await service.obtenerCuenta(cuentaId);

      expect(cuenta.id).toBe(cuentaId);
      expect(cuenta.numeroCuenta).toBe('001-111222333');
    });

    it('debe listar todas las cuentas activas', async () => {
      mockRepository.find.mockResolvedValue([
        {
          id: 'cuenta-1',
          socioId: 'socio-1',
          numeroCuenta: '001-111222333',
          saldo: 1000,
          tipoCuenta: 'AHORRO',
          estado: 'ACTIVA',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ]);

      const cuentas = await service.obtenerTodasCuentas();

      expect(cuentas).toHaveLength(1);
      expect(cuentas[0].estado).toBe('ACTIVA');
    });

    it('debe eliminar una cuenta (lógica)', async () => {
      const cuenta = {
        id: 'cuenta-1',
        socioId: 'socio-1',
        numeroCuenta: '001-111222333',
        saldo: 1000,
        tipoCuenta: 'AHORRO',
        estado: 'ACTIVA',
        activo: true,
      };

      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockResolvedValue({ ...cuenta, activo: false, estado: 'CANCELADA' });

      await service.eliminarCuenta('cuenta-1');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ activo: false, estado: 'CANCELADA' })
      );
    });

    it('debe lanzar error al eliminar cuenta inexistente', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminarCuenta('cuenta-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe realizar un depósito en cuenta activa', async () => {
      const cuenta = {
        id: 'cuenta-1',
        saldo: 1000,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockImplementation((actualizada) => Promise.resolve(actualizada));

      const resultado = await service.realizarDeposito('cuenta-1', 250);

      expect(resultado.saldo).toBe(1250);
    });

    it('debe realizar un retiro en cuenta activa', async () => {
      const cuenta = {
        id: 'cuenta-1',
        saldo: 800,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockImplementation((actualizada) => Promise.resolve(actualizada));

      const resultado = await service.realizarRetiro('cuenta-1', 300);

      expect(resultado.saldo).toBe(500);
    });

    it('debe lanzar error si la cuenta no existe en retiro', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.realizarRetiro('cuenta-inexistente', 100)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe rechazar depósito si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.realizarDeposito('cuenta-inexistente', 100)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('❌ Manejo de Errores', () => {
    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerCuenta('cuenta-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('debe manejar errores de base de datos apropiadamente', async () => {
      const request: CuentaRequestDto = {
        socioId: 'socio-123',
        numeroCuenta: '1234567890',
        saldo: 1000,
        tipoCuenta: 'AHORROS',
      };

      mockSociosClient.validarSocioExiste.mockResolvedValue({ activo: true });
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(request as any);
      mockRepository.save.mockRejectedValue(new Error('Database connection error'));

      await expect(service.crearCuenta(request)).rejects.toThrow('Database connection error');
    });
  });
});
