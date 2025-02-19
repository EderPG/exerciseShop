import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { tblSales } from './entities/sale.entity';
import { tblSaleDetails } from './entities/sale-detail.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([tblSales, tblSaleDetails]),
    ProductsModule, 
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}