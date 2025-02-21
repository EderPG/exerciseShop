import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { tblSales } from './entities/sale.entity';
import { tblSaleDetails } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { tblProducts } from '../products/entities/product.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger('SalesService');

  constructor(
    @InjectRepository(tblSales)
    private readonly saleRepository: Repository<tblSales>,

    @InjectRepository(tblSaleDetails)
    private readonly saleDetailRepository: Repository<tblSaleDetails>,

    @InjectRepository(tblProducts)
    private readonly productRepository: Repository<tblProducts>,

    private readonly datasource: DataSource,
  ) {}

  async processSale(createSaleDto: CreateSaleDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createSaleDto.discount !== 10 && createSaleDto.discount !== 20) {
        throw new BadRequestException('El descuento debe ser del 10% o 20%.');
      }

      let totalProductsSold = 0;
      let totalOperation = 0;
      const saleDetails = [];
      const saleDate = new Date();
      const discount = createSaleDto.discount / 100;

      for (const item of createSaleDto.items) {
        const product = await this.productRepository.findOne({
          where: { Product_strId: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado`,
          );
        }

        const name = product.Product_strName;
        const description = product.Product_strDescription;
        const priceBuy = product.Product_floPriceBuy;
        const priceSell = product.Product_floPriceSell;
        const subtotal = item.quantity * priceSell;
        totalProductsSold += item.quantity;
        totalOperation += subtotal;

        const profitPercentage =
          priceSell > 0 ? ((priceSell - priceBuy) / priceSell) * 100 : 0;

        saleDetails.push({
          name,
          description,
          quantity: item.quantity,
          price: priceSell,
          costBuy: priceBuy,
          profitPercentage: profitPercentage,
          subtotal: subtotal,
        });
      }

      const totalWithDiscount = totalOperation * (1 - discount);

      for (const detail of saleDetails) {
        detail.total = (detail.subtotal * (1 - discount)).toFixed(2);
      }

      const sale = this.saleRepository.create({
        Sale_intTotalProductsSold: totalProductsSold,
        Sale_floTotalOperation: totalWithDiscount,
        Sale_dtmSaleDate: saleDate,
      });

      await this.saleRepository.save(sale);

      for (const detail of saleDetails) {
        const saleDetail = this.saleDetailRepository.create({
          SaleDetail_strDescription: detail.description,
          SaleDetail_intQuantity: detail.quantity,
          SaleDetail_floPriceSell: detail.price,
          SaleDetail_floTotal: detail.total,
          SaleDetail_floSubtotal: detail.subtotal,
          SaleDetail_floPriceBuy: detail.costBuy,
          SaleDetail_floProfitPercentage: detail.profitPercentage,
          Sale: sale,
        });
        await this.saleDetailRepository.save(saleDetail);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Venta procesada exitosamente',
        totalProductsSold,
        totalOperation: totalWithDiscount.toFixed(2),
        saleDate,
        saleDetails,
        discount: `${createSaleDto.discount}%`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new BadRequestException(
          'Error al procesar la venta. Por favor, inténtelo de nuevo.',
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
