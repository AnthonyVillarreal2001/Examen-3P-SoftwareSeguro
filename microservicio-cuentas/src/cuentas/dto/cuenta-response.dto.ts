/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CuentaResponseDto {
  @ApiProperty({
    description: 'ID único de la cuenta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'ID del socio propietario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  socioId: string;

  @ApiProperty({
    description: 'Número de cuenta',
    example: '001-123456789'
  })
  numeroCuenta: string;

  @ApiProperty({
    description: 'Saldo actual',
    example: 1500.50
  })
  saldo: number;

  @ApiProperty({
    description: 'Estado de la cuenta',
    enum: ['ACTIVA', 'SUSPENDIDA', 'CANCELADA'],
    example: 'ACTIVA'
  })
  estado: string;

  @ApiProperty({
    description: 'Tipo de cuenta',
    example: 'AHORRO'
  })
  tipoCuenta: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z'
  })
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z'
  })
  fechaActualizacion: Date;
}