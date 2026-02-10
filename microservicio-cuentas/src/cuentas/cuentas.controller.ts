/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CuentasService } from './cuentas.service';
import { CuentaRequestDto } from './dto/cuenta-request.dto';
import { CuentaResponseDto } from './dto/cuenta-response.dto';

@ApiTags('cuentas')
@Controller('cuentas')
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta' })
  @ApiResponse({ 
    status: 201, 
    description: 'Cuenta creada exitosamente',
    type: CuentaResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflicto - Número de cuenta ya existe' 
  })
  async crearCuenta(@Body() request: CuentaRequestDto): Promise<CuentaResponseDto> {
    return this.cuentasService.crearCuenta(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta existente' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta' })
  async actualizarCuenta(
    @Param('id') id: string,
    @Body() request: CuentaRequestDto,
  ): Promise<CuentaResponseDto> {
    return this.cuentasService.actualizarCuenta(id, request);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por ID' })
  async obtenerCuenta(@Param('id') id: string): Promise<CuentaResponseDto> {
    return this.cuentasService.obtenerCuenta(id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas activas' })
  async obtenerTodas(): Promise<CuentaResponseDto[]> {
    return this.cuentasService.obtenerTodasCuentas();
  }

  @Get('socio/:socioId')
  @ApiOperation({ summary: 'Obtener cuentas por socio' })
  @ApiParam({ name: 'socioId', description: 'ID del socio' })
  async obtenerPorSocio(@Param('socioId') socioId: string): Promise<CuentaResponseDto[]> {
    return this.cuentasService.obtenerCuentasPorSocio(socioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar cuenta (lógico)' })
  async eliminarCuenta(@Param('id') id: string): Promise<void> {
    return this.cuentasService.eliminarCuenta(id);
  }

  @Post(':id/retiro')
  @ApiOperation({ summary: 'Realizar retiro de cuenta' })
  async realizarRetiro(
    @Param('id') id: string,
    @Body('monto') monto: number,
  ): Promise<CuentaResponseDto> {
    return this.cuentasService.realizarRetiro(id, monto);
  }

  @Post(':id/deposito')
  @ApiOperation({ summary: 'Realizar depósito a cuenta' })
  async realizarDeposito(
    @Param('id') id: string,
    @Body('monto') monto: number,
  ): Promise<CuentaResponseDto> {
    return this.cuentasService.realizarDeposito(id, monto);
  }
}