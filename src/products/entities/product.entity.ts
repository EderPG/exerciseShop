import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class tblProducts {
  @PrimaryGeneratedColumn('uuid')
  Product_stringId: string;

  @Column('text', {
    unique: true,
  })
  Product_stringName: string;

  @Column('text', {
    unique: true,
  })
  Product_stringUniqueKey: string;

  @Column('text', {
    nullable: true,
  })
  Product_stringDescription: string;

  @Column('float', {
    default: 0,
  })
  Product_floatPriceBuy: number;

  @Column('float', {
    default: 0,
  })
  Product_floatPriceSell: number;

  @Column('int', {
    default: 0,
  })
  Product_intStock: number;
}
