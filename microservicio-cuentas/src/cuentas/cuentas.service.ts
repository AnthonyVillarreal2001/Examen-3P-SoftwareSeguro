/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { CuentaRequestDto } from './dto/cuenta-request.dto';
import { CuentaResponseDto } from './dto/cuenta-response.dto';
import { SociosClientService } from './services/socios-client.service';

@Injectable()
export class CuentasService {
  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private readonly sociosClientService: SociosClientService,
  ) {}

  async crearCuenta(request: CuentaRequestDto): Promise<CuentaResponseDto> {
    // VALIDACIÓN CROSS-SERVICE: Verificar que el socio existe y está activo
    await this.sociosClientService.validarSocioExiste(request.socioId);

    // Verificar número de cuenta único
    const cuentaExistente = await this.cuentaRepository.findOne({
      where: { numeroCuenta: request.numeroCuenta, activo: true }
    });

    if (cuentaExistente) {
      throw new ConflictException('El número de cuenta ya existe');
    }

    const cuenta = this.cuentaRepository.create({
      socioId: request.socioId,
      numeroCuenta: request.numeroCuenta,
      saldo: request.saldo,
      tipoCuenta: request.tipoCuenta,
      estado: 'ACTIVA',
      activo: true,
    });

    const cuentaGuardada = await this.cuentaRepository.save(cuenta);
    return this.mapToResponse(cuentaGuardada);
  }

  async actualizarCuenta(id: string, request: CuentaRequestDto): Promise<CuentaResponseDto> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id, activo: true }
    });
    
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    // Verificar si el nuevo número de cuenta ya existe (excluyendo la actual)
    if (request.numeroCuenta !== cuenta.numeroCuenta) {
      const cuentaConMismoNumero = await this.cuentaRepository.findOne({
        where: { numeroCuenta: request.numeroCuenta, activo: true }
      });
      
      if (cuentaConMismoNumero) {
        throw new ConflictException('El número de cuenta ya está en uso');
      }
    }

    cuenta.socioId = request.socioId;
    cuenta.numeroCuenta = request.numeroCuenta;
    cuenta.tipoCuenta = request.tipoCuenta;

    const cuentaActualizada = await this.cuentaRepository.save(cuenta);
    return this.mapToResponse(cuentaActualizada);
  }

  async obtenerCuenta(id: string): Promise<CuentaResponseDto> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id, activo: true }
    });
    
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    return this.mapToResponse(cuenta);
  }

  async obtenerCuentasPorSocio(socioId: string): Promise<CuentaResponseDto[]> {
    const cuentas = await this.cuentaRepository.find({
      where: { socioId, activo: true },
      order: { fechaCreacion: 'DESC' }
    });
    
    return cuentas.map(cuenta => this.mapToResponse(cuenta));
  }

  async obtenerTodasCuentas(): Promise<CuentaResponseDto[]> {
    const cuentas = await this.cuentaRepository.find({
      where: { activo: true, estado: 'ACTIVA' }
    });
    
    return cuentas.map(cuenta => this.mapToResponse(cuenta));
  }

  async eliminarCuenta(id: string): Promise<void> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id, activo: true }
    });
    
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    // Eliminación lógica
    cuenta.activo = false;
    cuenta.estado = 'CANCELADA';
    await this.cuentaRepository.save(cuenta);
  }

  async realizarRetiro(id: string, monto: number): Promise<CuentaResponseDto> {
    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      throw new BadRequestException('Monto inválido');
    }

    const cuenta = await this.cuentaRepository.findOne({
      where: { id, activo: true }
    });
    
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    if (cuenta.estado !== 'ACTIVA') {
      throw new ConflictException('La cuenta no está activa');
    }

    const saldoActual = Number(cuenta.saldo);
    if (!Number.isFinite(saldoActual)) {
      throw new ConflictException('Saldo inválido');
    }

    if (saldoActual < montoNumerico) {
      throw new ConflictException('Saldo insuficiente');
    }

    cuenta.saldo = saldoActual - montoNumerico;
    const cuentaActualizada = await this.cuentaRepository.save(cuenta);
    return this.mapToResponse(cuentaActualizada);
  }

  async realizarDeposito(id: string, monto: number): Promise<CuentaResponseDto> {
    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      throw new BadRequestException('Monto inválido');
    }

    const cuenta = await this.cuentaRepository.findOne({
      where: { id, activo: true }
    });
    
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    if (cuenta.estado !== 'ACTIVA') {
      throw new ConflictException('La cuenta no está activa');
    }

    const saldoActual = Number(cuenta.saldo);
    if (!Number.isFinite(saldoActual)) {
      throw new ConflictException('Saldo inválido');
    }

    cuenta.saldo = saldoActual + montoNumerico;
    const cuentaActualizada = await this.cuentaRepository.save(cuenta);
    return this.mapToResponse(cuentaActualizada);
  }

  private mapToResponse(cuenta: Cuenta): CuentaResponseDto {
    return {
      id: cuenta.id,
      socioId: cuenta.socioId,
      numeroCuenta: cuenta.numeroCuenta,
      saldo: parseFloat(cuenta.saldo.toString()),
      estado: cuenta.estado,
      tipoCuenta: cuenta.tipoCuenta,
      fechaCreacion: cuenta.fechaCreacion,
      fechaActualizacion: cuenta.fechaActualizacion,
    };
  }
}