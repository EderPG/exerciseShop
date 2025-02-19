import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { tblSales } from './sale.entity';

@Entity('tblSaleDetails')
export class tblSaleDetails {
  @PrimaryGeneratedColumn('uuid')
  SaleDetail_uuidId: string;

  @Column('text', { nullable: true })
  SaleDetail_strDescription: string;

  @Column('int')
  SaleDetail_intQuantity: number;

  @Column('float')
  SaleDetail_floPriceSell: number;

  @Column('float')
  SaleDetail_floTotal: number;

  @Column('float')
  SaleDetail_floSubtotal: number;

  @Column('float')
  SaleDetail_floPriceBuy: number;

  @Column('float')
  SaleDetail_floProfitPercentage: number;

  @ManyToOne(() => tblSales, (sale) => sale.SaleDetails)
  Sale: tblSales;
}
