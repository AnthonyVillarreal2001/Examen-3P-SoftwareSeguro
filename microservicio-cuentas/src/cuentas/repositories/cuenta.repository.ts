/* eslint-disable prettier/prettier */
// Opcional: Si quieres mantener un repositorio personalizado
import { Repository } from 'typeorm';
import { Cuenta } from '../entities/cuenta.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CuentaRepository extends Repository<Cuenta> {
  
  async findBySocioId(socioId: string): Promise<Cuenta[]> {
    return this.find({ 
      where: { socioId, activo: true },
      order: { fechaCreacion: 'DESC' }
    });
  }

  async findByNumeroCuenta(numeroCuenta: string): Promise<Cuenta | null> {
    return this.findOne({ 
      where: { numeroCuenta, activo: true }
    });
  }

  async findActivas(): Promise<Cuenta[]> {
    return this.find({ 
      where: { activo: true, estado: 'ACTIVA' }
    });
  }
}