import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';

@Entity()
export class SaleDetail {
  @PrimaryGeneratedColumn('uuid')
  SaleDetail_stringId: string;

  @Column('text')
  Product_stringDescription: string;

  @Column('int')
  Product_intQuantity: number;

  @Column('float')
  Product_floatPriceSell: number;

  @Column('float')
  Product_floatTotal: number;

  @Column('float')
  Product_floatSubtotal: number;

  @Column('float')
  Product_floatPriceBuy: number;

  @Column('float')
  Product_floatProfitPercentage: number;

  @Column('float')
  Product_floatDiscount: number;

  @ManyToOne(() => Sale, (sale) => sale.SaleDetails)
  sale: Sale;
}