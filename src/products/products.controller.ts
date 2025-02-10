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
  } from '@nestjs/common';
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";


@Controller('products')
export class ProductsController{
    constructor(private readonly productsService: ProductsService){}

    @Post()
    create(@Body() createProductDto: CreateProductDto){
        return this.productsService.create(createProductDto);
    }

    @Get()
    getAllProducts(){
        return this.productsService.findAll();
    }

    @Get(':term')
    findOne(@Param('term') term:string){
        return this.productsService.findOne(term);
    }
    
}