/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SociosClientService } from '../services/socios-client.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock de fetch global
global.fetch = jest.fn();

describe('SociosClientService - Pruebas de Integración', () => {
  let service: SociosClientService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SociosClientService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8080'),
          },
        },
      ],
    }).compile();

    service = module.get<SociosClientService>(SociosClientService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validarSocioExiste', () => {
    it('debe validar correctamente un socio activo', async () => {
      const mockSocio = {
        id: 'socio-123',
        identificacion: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSocio,
      });

      const resultado = await service.validarSocioExiste('socio-123');

      expect(resultado).toEqual(mockSocio);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/socios/socio-123');
    });

    it('debe lanzar error si el socio no existe (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(service.validarSocioExiste('socio-inexistente'))
        .rejects
        .toThrow(new HttpException('El socio especificado no existe', HttpStatus.BAD_REQUEST));
    });

    it('debe lanzar error si el socio no está activo', async () => {
      const mockSocioInactivo = {
        id: 'socio-123',
        identificacion: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
        activo: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSocioInactivo,
      });

      await expect(service.validarSocioExiste('socio-123'))
        .rejects
        .toThrow(new HttpException('El socio no está activo', HttpStatus.BAD_REQUEST));
    });

    it('debe lanzar error si el servicio de socios no está disponible', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.validarSocioExiste('socio-123'))
        .rejects
        .toThrow(new HttpException(
          'No se pudo validar la existencia del socio. El servicio de socios no está disponible',
          HttpStatus.SERVICE_UNAVAILABLE
        ));
    });

    it('debe lanzar error si el servicio retorna error 500', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.validarSocioExiste('socio-123'))
        .rejects
        .toThrow(new HttpException(
          'Error al comunicarse con el servicio de socios',
          HttpStatus.SERVICE_UNAVAILABLE
        ));
    });
  });

  describe('Pruebas de Timeout y Resiliencia', () => {
    it('debe manejar timeouts del servicio de socios', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(service.validarSocioExiste('socio-123'))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('socioTieneCuentasActivas', () => {
    it('debe retornar false por defecto', async () => {
      const resultado = await service.socioTieneCuentasActivas('socio-1');
      expect(resultado).toBe(false);
    });

    it('debe lanzar HttpException cuando ocurre un error interno', async () => {
      const logger = {
        log: jest.fn(() => {
          throw new Error('boom');
        }),
        error: jest.fn(),
      };

      (service as any).logger = logger;

      await expect(service.socioTieneCuentasActivas('socio-1')).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
