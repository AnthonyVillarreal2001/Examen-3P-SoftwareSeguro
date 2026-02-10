/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SocioValidationResponse {
  id: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

@Injectable()
export class SociosClientService {
  private readonly logger = new Logger(SociosClientService.name);
  private readonly sociosServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.sociosServiceUrl = this.configService.get<string>('SOCIOS_SERVICE_URL', 'http://localhost:8080');
  }

  async validarSocioExiste(socioId: string): Promise<SocioValidationResponse> {
    try {
      this.logger.log(`Validando existencia del socio: ${socioId}`);
      
      const response = await fetch(`${this.sociosServiceUrl}/api/socios/${socioId}`);
      
      if (response.status === 404) {
        throw new HttpException('El socio especificado no existe', HttpStatus.BAD_REQUEST);
      }

      if (!response.ok) {
        throw new HttpException(
          'Error al comunicarse con el servicio de socios',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      const socio = await response.json();
      
      if (!socio.activo) {
        throw new HttpException('El socio no está activo', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Socio ${socioId} validado correctamente`);
      return socio;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`Error al validar socio: ${error.message}`);
      throw new HttpException(
        'No se pudo validar la existencia del socio. El servicio de socios no está disponible',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async socioTieneCuentasActivas(socioId: string): Promise<boolean> {
    try {
      this.logger.log(`Verificando cuentas activas para socio: ${socioId}`);
      
      // Este método se usará desde el servicio de socios para verificar antes de eliminar
      // Por ahora retornamos false ya que la verificación se hace desde este microservicio
      return false;
    } catch (error) {
      this.logger.error(`Error al verificar cuentas activas: ${error.message}`);
      throw new HttpException(
        'Error al verificar cuentas activas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
