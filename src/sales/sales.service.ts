import { Injectable, Logger } from '@nestjs/common';
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
      let totalProductsSold = 0;
      let totalOperation = 0;
      const saleDetails = [];
      const saleDate = new Date();

      for (const item of createSaleDto.items) {
        const product = await this.productRepository.findOne({
          where: { Product_strId: item.Product_stringId },
        });

        if (!product) {
          throw new Error(
            `Error: Producto con ID ${item.Product_stringId} no encontrado`,
          );
        }

        const productDescription = product.Product_strDescription;

        const priceBuy = product.Product_floPriceBuy;
        const priceSell = product.Product_floPriceSell;

        if (priceSell <= 0) {
          throw new Error(
            `El producto ${product.Product_strName} tiene un precio de venta inválido.`,
          );
        }

        const subtotal = item.Product_intQuantity * priceSell;
        totalProductsSold += item.Product_intQuantity;
        totalOperation += subtotal;

        const profitPercentage =
          priceSell > 0 ? ((priceSell - priceBuy) / priceSell) * 100 : 0;

        saleDetails.push({
          description: productDescription,
          quantity: item.Product_intQuantity,
          price: priceSell,
          subtotal: subtotal,
          costBuy: priceBuy,
          profitPercentage: profitPercentage,
        });
      }

      const globalDiscount = totalOperation >= 100 ? 0.2 : 0.1;
      const totalWithDiscount = totalOperation * (1 - globalDiscount);

      for (const detail of saleDetails) {
        detail.total = (detail.subtotal * (1 - globalDiscount)).toFixed(2);
      }

      const sale = this.saleRepository.create({
        Sale_intTotalProductsSold: totalProductsSold,
        Sale_floTotalOperation: totalOperation,
        Sale_dtmSaleDate: saleDate,
        SaleDetails: saleDetails,
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
        globalDiscount: (globalDiscount * 100).toFixed(0) + '%',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new Error(`Error al procesar la venta: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
