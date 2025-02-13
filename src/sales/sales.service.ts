import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { tblProducts } from '../products/entities/product.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger('SalesService');

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly saleDetailRepository: Repository<SaleDetail>,
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
          where: { Product_stringId: item.Product_stringId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.Product_stringId} not found`);
        }

        const subtotal = item.Product_intQuantity * item.Product_floatPriceSell;
        const discount = item.Product_floatDiscount || 0;
        const total = subtotal - discount;

        totalProductsSold += item.Product_intQuantity;
        totalOperation += total;

        const profitPercentage =
          ((item.Product_floatPriceSell - product.Product_floatPriceBuy) /
            item.Product_floatPriceSell) *
          100;

        saleDetails.push({
          Product_stringDescription: product.Product_stringDescription,
          Product_intQuantity: item.Product_intQuantity,
          Product_floatPriceSell: item.Product_floatPriceSell,
          Product_floatTotal: total,
          Product_floatSubtotal: subtotal,
          Product_floatPriceBuy: product.Product_floatPriceBuy,
          Product_floatProfitPercentage: profitPercentage,
          Product_floatDiscount: discount,
        });
      }

      let globalDiscount = 0;
      if (totalOperation >= 1000) {
        globalDiscount = 0.2;
      } else {
        globalDiscount = 0.1;
      }
      const totalWithDiscount = totalOperation * (1 - globalDiscount);

      const sale = this.saleRepository.create({
        Sale_intTotalProductsSold: totalProductsSold,
        Sale_floatTotalOperation: totalWithDiscount,
        Sale_dateSaleDate: saleDate,
      });
      await this.saleRepository.save(sale);

      for (const detail of saleDetails) {
        const saleDetail = this.saleDetailRepository.create({
          ...detail,
          sale,
        });
        await this.saleDetailRepository.save(saleDetail);
      }

      await queryRunner.commitTransaction();

      return {
        totalProductsSold,
        totalOperation: totalWithDiscount,
        saleDate,
        saleDetails,
        globalDiscount: globalDiscount * 100,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new Error('Error processing sale');
    } finally {
      await queryRunner.release();
    }
  }
}
