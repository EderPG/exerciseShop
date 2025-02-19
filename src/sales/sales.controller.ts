import { Controller, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('venta')
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.processSale(createSaleDto);
  }
}
