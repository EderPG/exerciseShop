import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly datasource: DataSource,
  ) {}

  findAll() {
    return this.productRepository.find();
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const { ...productDetails } = createProductDto; //donde se guardaran datos
      const product = this.productRepository.create({
        ...productDetails,
      });
      await this.productRepository.save(product);
      return { ...product };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('name =: name or unique_key =: unique_key',
        {
          name: term,
          unique_key: term,
        }).getOne();
    }
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
