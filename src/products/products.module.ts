import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { tblProducts } from './entities/product.entity';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [TypeOrmModule.forFeature([tblProducts])]
})
export class ProductsModule {}
