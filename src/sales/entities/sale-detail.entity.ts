import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';

@Entity()
export class SaleDetail {
  @PrimaryGeneratedColumn('uuid')
  SaleDetail_strgId: string;

  @Column('text')
  Product_strDescription: string;

  @Column('int')
  Product_intQuantity: number;

  @Column('float')
  Product_floPriceSell: number;

  @Column('float')
  Product_floTotal: number;

  @Column('float')
  Product_floSubtotal: number;

  @Column('float')
  Product_floPriceBuy: number;

  @Column('float')
  Product_floProfitPercentage: number;

  @ManyToOne(() => Sale, (sale) => sale.SaleDetails)
  sale: Sale;
}
