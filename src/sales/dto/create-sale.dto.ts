import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsNotEmpty()
  Product_stringId: string;

  @IsNotEmpty()
  @IsNumber()
  Product_intQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  Product_floatPriceSell: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
