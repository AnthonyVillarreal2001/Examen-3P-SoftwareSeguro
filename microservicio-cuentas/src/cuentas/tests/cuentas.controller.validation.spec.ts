/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CuentasValidacionController } from '../cuentas.controller.validation';
import { CuentasService } from '../cuentas.service';


describe('CuentasValidacionController', () => {
  let controller: CuentasValidacionController;
  let service: CuentasService;

  const mockService = {
    obtenerCuentasPorSocio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasValidacionController],
      providers: [
        {
          provide: CuentasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CuentasValidacionController>(CuentasValidacionController);
    service = module.get<CuentasService>(CuentasService);

    jest.clearAllMocks();
  });

  it('debe retornar false si no hay cuentas activas', async () => {
    mockService.obtenerCuentasPorSocio.mockResolvedValue([]);

    const resultado = await controller.verificarCuentasActivas('socio-1');

    expect(resultado).toEqual({
      socioId: 'socio-1',
      tieneCuentasActivas: false,
      numeroCuentasActivas: 0,
    });
    expect(service.obtenerCuentasPorSocio).toHaveBeenCalledWith('socio-1');
  });

  it('debe retornar true cuando hay cuentas activas', async () => {
    mockService.obtenerCuentasPorSocio.mockResolvedValue([
      { id: 'cuenta-1' },
      { id: 'cuenta-2' },
    ]);

    const resultado = await controller.verificarCuentasActivas('socio-2');

    expect(resultado.tieneCuentasActivas).toBe(true);
    expect(resultado.numeroCuentasActivas).toBe(2);
  });
});
