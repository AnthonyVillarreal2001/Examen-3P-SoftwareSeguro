/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CuentasController } from './cuentas.controller';
import { CuentasValidacionController } from './cuentas.controller.validation';
import { CuentasService } from './cuentas.service';
import { Cuenta } from './entities/cuenta.entity';
import { SociosClientService } from './services/socios-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cuenta]),
    ConfigModule,
  ],
  controllers: [CuentasController, CuentasValidacionController],
  providers: [CuentasService, SociosClientService],
  exports: [CuentasService],
})
export class CuentasModule {}