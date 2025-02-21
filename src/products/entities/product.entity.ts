import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class tblProducts {
  @PrimaryGeneratedColumn('uuid')
  Product_strId: string;

  @Column('text')
  Product_strName: string;

  @Column('text', {
    unique: true,
  })
  Product_strUniqueKey: string;

  @Column('text')
  Product_strDescription: string;

  @Column('float', {
    default: 0,
  })
  Product_floPriceBuy: number;

  @Column('float', {
    default: 0,
  })
  Product_floPriceSell: number;

  @Column('int', {
    default: 0,
  })
  Product_intStock: number;
}
