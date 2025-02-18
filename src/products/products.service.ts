import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { tblProducts } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(tblProducts)
    private readonly productRepository: Repository<tblProducts>,
  ) {}

  private mapDtoToEntity(dto: CreateProductDto): Partial<tblProducts> {
    return {
      Product_strName: dto.nameProduct,
      Product_strUniqueKey: dto.uniquekeyProduct,
      Product_strDescription: dto.descriptionProduct,
      Product_floPriceBuy: dto.pricebuyProduct,
      Product_floPriceSell: dto.pricesellProduct,
      Product_intStock: dto.stockProduct,
    };
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const productData = this.mapDtoToEntity(createProductDto);
      const newProduct = this.productRepository.create(productData);
      await this.productRepository.save(newProduct);
      return {
        message: 'Producto Creado',
        data: {
          nameProduct: createProductDto.nameProduct,
          uniqueKeyProduct: createProductDto.uniquekeyProduct,
          descriptionProduct: createProductDto.descriptionProduct,
          priceBuyProduct: createProductDto.pricebuyProduct,
          priceSellProduct: createProductDto.pricesellProduct,
          stockProduct: createProductDto.stockProduct,
        },
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: tblProducts;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({
        Product_strId: term,
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //se referencia el nombre de las columnas
      product = await queryBuilder
        .where(
          'UPPER(prod.Product_strName)= :nameProduct or prod.Product_strUniqueKey= :uniquekeyProduct',
          {
            nameProduct: term.toUpperCase(),
            uniquekeyProduct: term.toUpperCase(),
          },
        )
        .getOne();
    }
    if (!product) throw new NotFoundException(`No existe el producto con el nombre ${term}`);
    return product;
  }

  async findProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<tblProducts[]> {
    const queryBuilder = this.productRepository.createQueryBuilder();
    const products = await queryBuilder
      .where(
        'tblProducts.Product_floPriceSell BETWEEN :minPrice AND :maxPrice',
        {
          minPrice,
          maxPrice,
        },
      )
      .getMany();

    return products;
  }

  async orderPriceAsc() {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      const products = await queryBuilder
        .orderBy('prod.Product_floPriceBuy', 'ASC')
        .getMany();
      return products;
    } catch (error) {
      throw new BadRequestException('Sin datos');
    }
  }

  async orderPriceDesc() {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      const products = await queryBuilder
        .orderBy('prod.Product_floPriceBuy', 'DESC')
        .getMany();
      return products;
    } catch (error) {
      throw new BadRequestException('Sin datos');
    }
  }

  async nameAsc() {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      const products = await queryBuilder
        .orderBy('prod.Product_strName', 'ASC')
        .getMany();
      return products;
    } catch (error) {
      throw new BadRequestException('Sin datos');
    }
  }

  async nameDesc() {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      const products = await queryBuilder
        .orderBy('prod.Product_strName', 'DESC')
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
