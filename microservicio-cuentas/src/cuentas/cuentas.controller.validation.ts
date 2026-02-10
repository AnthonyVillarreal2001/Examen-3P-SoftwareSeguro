/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CuentasService } from './cuentas.service';

@ApiTags('validaciones')
@Controller('api/cuentas/validaciones')
export class CuentasValidacionController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Get('socio/:socioId/tiene-cuentas-activas')
  @ApiOperation({ 
    summary: 'Verificar si un socio tiene cuentas activas',
    description: 'Endpoint usado por el microservicio de Socios para verificar antes de eliminar un socio'
  })
  @ApiParam({ name: 'socioId', description: 'ID del socio a verificar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna true si el socio tiene cuentas activas, false si no tiene',
    schema: {
      type: 'object',
      properties: {
        socioId: { type: 'string' },
        tieneCuentasActivas: { type: 'boolean' },
        numeroCuentasActivas: { type: 'number' }
      }
    }
  })
  async verificarCuentasActivas(@Param('socioId') socioId: string) {
    const cuentas = await this.cuentasService.obtenerCuentasPorSocio(socioId);
    
    return {
      socioId,
      tieneCuentasActivas: cuentas.length > 0,
      numeroCuentasActivas: cuentas.length
    };
  }
}
