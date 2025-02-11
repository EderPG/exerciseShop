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
      .where('UPPER(Product_stringName)=:Product_stringName or Product_stringUniqueKey=:Product_stringUniqueKey',
        {
          nameProduct: term.toUpperCase(),
          uniquekeyProduct: term.toUpperCase(),
        }).getOne();
    }
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  async findProductsByPriceRange(minPrice: number, maxPrice: number): Promise<tblProducts[]> {
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      throw new Error('Invalid price range');
    }
    const queryBuilder = this.productRepository.createQueryBuilder('prod');
    
    const products = await queryBuilder
      .where('prod.Product_floatPriceSell BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      })
      .getMany();
  
    if (products.length === 0) {
      throw new NotFoundException(`No products found within the price range of ${minPrice} to ${maxPrice}`);
    }
  
    return products;
  }
  



















  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
