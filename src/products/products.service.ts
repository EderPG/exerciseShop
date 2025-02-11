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

  async create(createProductDto: CreateProductDto) {
    try {
      const { ...productDetails } = createProductDto; //donde se guardaran datos
      const product = this.productRepository.create({...productDetails,});
      await this.productRepository.save(product);
      return { ...product };
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
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(Product_stringName)= :Product_stringName or uniquekeyProduct= :Product_stringUniqueKey',
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
