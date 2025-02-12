import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    BadRequestException,
  } from '@nestjs/common';
import { ProductsService } from "./products.service";
import { tblProducts } from './entities/product.entity';
import { CreateProductDto } from "./dto/create-product.dto";
import { PaginationDto } from 'src/common/dtos/pagination.dto';


@Controller('products')
export class ProductsController{
    constructor(private readonly productsService: ProductsService){}

    @Post()
    create(@Body() createProductDto: CreateProductDto){
        return this.productsService.create(createProductDto);
    }

    @Get()
    getAllProducts(@Query() paginationDto:PaginationDto){
        return this.productsService.findAll(paginationDto);
    }

    
    @Get('RangePrice')  //
    getProductsPriceRange(
        @Query('minPrice') minPrice: number,
        @Query('maxPrice') maxPrice: number,
    ): Promise<tblProducts[]> {
        return this.productsService.findProductsByPriceRange(minPrice, maxPrice);
    }
    
    @Get('OrderAsc')
    getOrderAsc(){
        return this.productsService.orderPriceAsc();
    }
    
    @Get(':term')
    findOne(@Param('term') term:string){
        return this.productsService.findOne(term);
    }

}