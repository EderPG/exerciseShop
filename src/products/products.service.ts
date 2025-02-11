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

  findAll() {
    return this.productRepository.find();
  }

  async findOne(term: string) {
    let product: tblProducts;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ Product_stringId: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(name) =:name or unique_key =:unique_key',
        {
          name: term.toUpperCase(),
          unique_key: term.toUpperCase(),
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
