/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('cuentas')
export class Cuenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({ name: 'socio_id', type: 'varchar', length: 36 })
  socioId: string;

  @Column({ unique: true, length: 20 })
  numeroCuenta: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo: number;

  @Column({ 
    type: 'enum', 
    enum: ['ACTIVA', 'SUSPENDIDA', 'CANCELADA'],
    default: 'ACTIVA'
  })
  estado: string;

  @Column({ type: 'varchar', length: 50 })
  tipoCuenta: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @Column({ default: true })
  activo: boolean;
}