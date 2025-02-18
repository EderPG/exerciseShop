import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';


export class CreateProductDto {
  @IsString()
  @MinLength(1)
  nameProduct: string;

  @IsString()
  @MinLength(1)
  uniquekeyProduct: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  descriptionProduct?: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  priceBuyProduct: number;

  @IsNumber()
  @IsPositive()
  @Min(0)
  priceSellProduct: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stockProduct?: number;
}
