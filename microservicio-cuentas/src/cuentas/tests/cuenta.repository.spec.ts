/* eslint-disable prettier/prettier */
import { CuentaRepository } from '../repositories/cuenta.repository';


describe('CuentaRepository', () => {
  it('findBySocioId debe delegar en find con filtros', async () => {
    const repo = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as CuentaRepository;

    await CuentaRepository.prototype.findBySocioId.call(repo, 'socio-1');

    expect(repo.find).toHaveBeenCalledWith({
      where: { socioId: 'socio-1', activo: true },
      order: { fechaCreacion: 'DESC' },
    });
  });

  it('findByNumeroCuenta debe delegar en findOne con filtros', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as CuentaRepository;

    await CuentaRepository.prototype.findByNumeroCuenta.call(repo, '001-111222333');

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { numeroCuenta: '001-111222333', activo: true },
    });
  });

  it('findActivas debe delegar en find con filtros', async () => {
    const repo = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as CuentaRepository;

    await CuentaRepository.prototype.findActivas.call(repo);

    expect(repo.find).toHaveBeenCalledWith({
      where: { activo: true, estado: 'ACTIVA' },
    });
  });
});
