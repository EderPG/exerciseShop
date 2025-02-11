import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateProductDto{

    @IsString()
    @MinLength(1)
    Product_stringName: string; //solo funciona con ese nombre ¿?

    @IsString()
    @MinLength(1)
    uniquekeyProduct: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    descriptionProduct?: string;

    @IsNumber()
    @IsPositive()
    pricebuyProduct: number;

    @IsNumber()
    @IsPositive()
    pricesellProduct: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stockProduct?: number;

}