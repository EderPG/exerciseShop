import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tblProducts } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  private readonly columnMap = {
    nameProduct: 'Product_strName',
    uniqueKeyProduct: 'Product_strUniqueKey',
    descriptionProduct: 'Product_strDescription',
    priceBuyProduct: 'Product_floPriceBuy',
    priceSellProduct: 'Product_floPriceSell',
    stockProduct: 'Product_intStock',
  };

  constructor(
    @InjectRepository(tblProducts)
    private readonly productRepository: Repository<tblProducts>,
  ) {}

  private mapDtoToEntity(dto: CreateProductDto): Partial<tblProducts> {
    return {
      Product_strName: dto.nameProduct,
      Product_strUniqueKey: dto.uniqueKeyProduct,
      Product_strDescription: dto.descriptionProduct,
      Product_floPriceBuy: dto.priceBuyProduct,
      Product_floPriceSell: dto.priceSellProduct,
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
        data: createProductDto,
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAllWithFilters(
    paginationDto: PaginationDto,
  ): Promise<{ message: string; data: any[] }> {
    const { limit = 10, offset = 0, minPrice, maxPrice, orderBy, orderDirection, searchTerm } =
      paginationDto;

    const queryBuilder = this.productRepository.createQueryBuilder('prod');
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('prod.Product_floPriceSell BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        '(UPPER(prod.Product_strName) LIKE :searchTerm OR UPPER(prod.Product_strUniqueKey) LIKE :searchTerm)',
        { searchTerm: `%${searchTerm.toUpperCase()}%` },
      );
    }

    if (orderBy && orderDirection) {
      const dbColumn = this.columnMap[orderBy];
      if (dbColumn) {
        queryBuilder.orderBy(`prod.${dbColumn}`, orderDirection);
      }
    }

    queryBuilder.take(limit).skip(offset);
    const products = await queryBuilder.getMany();
    const formattedProducts = products.map((product) =>
      this.formatProductForResponse(product),
    );
    return {
      message: 'Consulta realizada con éxito',
      data: formattedProducts,
    };
  }

  private formatProductForResponse(product: tblProducts) {
    return {
      nameProduct: product.Product_strName,
      uniqueKeyProduct: product.Product_strUniqueKey,
      descriptionProduct: product.Product_strDescription,
      priceBuyProduct: product.Product_floPriceBuy,
      priceSellProduct: product.Product_floPriceSell,
      stockProduct: product.Product_intStock,
    };
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}