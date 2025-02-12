import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { tblProducts } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(tblProducts)
    private readonly productRepository: Repository<tblProducts>,
    private readonly datasource: DataSource,
  ) {}

  private mapDtoToEntity(dto: CreateProductDto): Partial<tblProducts> {
    return {
      Product_stringName: dto.nameProduct,
      Product_stringUniqueKey: dto.uniquekeyProduct,
      Product_stringDescription: dto.descriptionProduct,
      Product_floatPriceBuy: dto.pricebuyProduct,
      Product_floatPriceSell: dto.pricesellProduct,
      Product_intStock: dto.stockProduct,
    };
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const productData = this.mapDtoToEntity(createProductDto);
    const newProduct = this.productRepository.create(productData); 
    return await this.productRepository.save(newProduct);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {
    const {limit=10, offset=0}= paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: tblProducts;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ Product_stringId: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //se referencia el nombre de las columnas
      product = await queryBuilder
      .where('UPPER(prod.Product_stringName)= :nameProduct or prod.Product_stringUniqueKey= :uniquekeyProduct',
        {
          nameProduct: term.toUpperCase(),
          uniquekeyProduct: term.toUpperCase(),
        }).getOne();
    }
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  async findProductsByPriceRange(minPrice: number, maxPrice: number): Promise<tblProducts[]> {
    const queryBuilder = this.productRepository.createQueryBuilder();
    const products = await queryBuilder
      .where('tblProducts.Product_floatPriceSell BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      })
      .getMany();
  
    return products;
  }
  


  async orderPriceAsc(){
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      const products = await queryBuilder
      .orderBy('prod.Product_floatPriceBuy', 'ASC')
      .getMany();
      return products;  
    } catch (error) {
      throw new BadRequestException('Sin datos');
    }
    
  }

















  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
