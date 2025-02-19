import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SaleDetail } from './sale-detail.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  Sale_strId: string;

  @Column()
  Sale_intTotalProductsSold: number;

  @Column('float')
  Sale_floTotalOperation: number;

  @Column()
  Sale_dtmtSaleDate: Date;

  @OneToMany(() => SaleDetail, (detail) => detail.sale)
  SaleDetails: SaleDetail[];
}
