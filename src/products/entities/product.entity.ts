import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Product{
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique:true,
    })
    name: string;

    @Column('text', {
        unique:true,
    })
    unique_key: string;

    @Column('text', {
        nullable: true,
    })
    description: string;

    @Column('float',{
        default: 0,
        })
    price_buy: number;

    @Column('float',{
        default: 0,
    })
    price_sell: number;

    @Column('int', {
        default: 0,
    })
    stock: number;
}