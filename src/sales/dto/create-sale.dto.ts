import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsNotEmpty()
  Product_stringId: string;

  @IsNotEmpty()
  Product_intQuantity: number;

  @IsNotEmpty()
  Product_floatPriceSell: number;

  Product_floatDiscount?: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
