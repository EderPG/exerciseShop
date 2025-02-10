import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateProductDto{

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @MinLength(1)
    unique_key: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    price_buy: number;

    @IsNumber()
    @IsPositive()
    price_sell: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

}