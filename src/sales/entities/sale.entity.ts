import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SaleDetail } from './sale-detail.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  Sale_stringId: string;

  @Column()
  Sale_intTotalProductsSold: number;

  @Column('float')
  Sale_floatTotalOperation: number;

  @Column()
  Sale_dateSaleDate: Date;

  @OneToMany(() => SaleDetail, (detail) => detail.sale)
  SaleDetails: SaleDetail[];
}