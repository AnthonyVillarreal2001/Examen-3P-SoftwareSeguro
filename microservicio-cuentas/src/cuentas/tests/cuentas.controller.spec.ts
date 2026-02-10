/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from '../cuentas.controller';
import { CuentasService } from '../cuentas.service';
import { CuentaRequestDto } from '../dto/cuenta-request.dto';
import { CuentaResponseDto } from '../dto/cuenta-response.dto';

describe('CuentasController', () => {
  let controller: CuentasController;
  let service: CuentasService;

  const mockService = {
    crearCuenta: jest.fn(),
    actualizarCuenta: jest.fn(),
    obtenerCuenta: jest.fn(),
    obtenerTodasCuentas: jest.fn(),
    obtenerCuentasPorSocio: jest.fn(),
    eliminarCuenta: jest.fn(),
    realizarRetiro: jest.fn(),
    realizarDeposito: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [
        {
          provide: CuentasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CuentasController>(CuentasController);
    service = module.get<CuentasService>(CuentasService);

    jest.clearAllMocks();
  });

  it('debe crear una cuenta', async () => {
    const request: CuentaRequestDto = {
      socioId: 'socio-1',
      numeroCuenta: '001-111222333',
      saldo: 1000,
      tipoCuenta: 'AHORRO',
    };
    const response: CuentaResponseDto = {
      id: 'cuenta-1',
      socioId: request.socioId,
      numeroCuenta: request.numeroCuenta,
      saldo: request.saldo,
      estado: 'ACTIVA',
      tipoCuenta: request.tipoCuenta,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    mockService.crearCuenta.mockResolvedValue(response);

    const resultado = await controller.crearCuenta(request);

    expect(resultado).toEqual(response);
    expect(service.crearCuenta).toHaveBeenCalledWith(request);
  });

  it('debe actualizar una cuenta', async () => {
    const request: CuentaRequestDto = {
      socioId: 'socio-1',
      numeroCuenta: '001-999888777',
      saldo: 500,
      tipoCuenta: 'CORRIENTE',
    };

    mockService.actualizarCuenta.mockResolvedValue({} as CuentaResponseDto);

    await controller.actualizarCuenta('cuenta-1', request);

    expect(service.actualizarCuenta).toHaveBeenCalledWith('cuenta-1', request);
  });

  it('debe obtener una cuenta por id', async () => {
    mockService.obtenerCuenta.mockResolvedValue({} as CuentaResponseDto);

    await controller.obtenerCuenta('cuenta-1');

    expect(service.obtenerCuenta).toHaveBeenCalledWith('cuenta-1');
  });

  it('debe obtener todas las cuentas', async () => {
    mockService.obtenerTodasCuentas.mockResolvedValue([]);

    const resultado = await controller.obtenerTodas();

    expect(resultado).toEqual([]);
    expect(service.obtenerTodasCuentas).toHaveBeenCalled();
  });

  it('debe obtener cuentas por socio', async () => {
    mockService.obtenerCuentasPorSocio.mockResolvedValue([]);

    const resultado = await controller.obtenerPorSocio('socio-1');

    expect(resultado).toEqual([]);
    expect(service.obtenerCuentasPorSocio).toHaveBeenCalledWith('socio-1');
  });

  it('debe eliminar una cuenta', async () => {
    mockService.eliminarCuenta.mockResolvedValue(undefined);

    await controller.eliminarCuenta('cuenta-1');

    expect(service.eliminarCuenta).toHaveBeenCalledWith('cuenta-1');
  });

  it('debe realizar un retiro', async () => {
    mockService.realizarRetiro.mockResolvedValue({} as CuentaResponseDto);

    await controller.realizarRetiro('cuenta-1', 100);

    expect(service.realizarRetiro).toHaveBeenCalledWith('cuenta-1', 100);
  });

  it('debe realizar un deposito', async () => {
    mockService.realizarDeposito.mockResolvedValue({} as CuentaResponseDto);

    await controller.realizarDeposito('cuenta-1', 200);

    expect(service.realizarDeposito).toHaveBeenCalledWith('cuenta-1', 200);
  });
});
