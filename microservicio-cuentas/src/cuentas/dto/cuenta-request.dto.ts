/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsEnum, IsUUID } from 'class-validator';

export class CuentaRequestDto {
  @ApiProperty({
    description: 'ID del socio propietario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  socioId: string; // PROBLEMA: No valida que exista

  @ApiProperty({
    description: 'Número de cuenta único',
    example: '001-123456789'
  })
  @IsString()
  numeroCuenta: string;

  @ApiProperty({
    description: 'Saldo inicial',
    example: 1000.00,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  saldo: number;

  @ApiProperty({
    description: 'Tipo de cuenta',
    enum: ['AHORRO', 'CORRIENTE', 'PLAZO_FIJO'],
    example: 'AHORRO'
  })
  @IsEnum(['AHORRO', 'CORRIENTE', 'PLAZO_FIJO'])
  tipoCuenta: string;
}