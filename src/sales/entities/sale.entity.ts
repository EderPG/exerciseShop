import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { tblSaleDetails } from './sale-detail.entity';

@Entity('tblSales')
export class tblSales {
  @PrimaryGeneratedColumn('uuid')
  Sale_uuidId: string;

  @Column('int')
  Sale_intTotalProductsSold: number;

  @Column('float')
  Sale_floTotalOperation: number;

  @Column('timestamp')
  Sale_dtmSaleDate: Date;

  @OneToMany(() => tblSaleDetails, (detail) => detail.Sale)
  SaleDetails: tblSaleDetails[];
}
