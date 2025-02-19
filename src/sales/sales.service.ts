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
          where: { Product_strId: item.Product_stringId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.Product_stringId} not found`);
        }

        const subtotal = item.Product_intQuantity * item.Product_floatPriceSell;
        const total = subtotal;

        totalProductsSold += item.Product_intQuantity;
        totalOperation += total;

        const profitPercentage =
          ((item.Product_floatPriceSell - product.Product_floPriceBuy) /
            item.Product_floatPriceSell) *
          100;

        saleDetails.push({
          Product_strDescription: product.Product_strDescription,
          Product_intQuantity: item.Product_intQuantity,
          Product_floPriceSell: item.Product_floatPriceSell,
          Product_floTotal: total,
          Product_floSubtotal: subtotal,
          Product_floPriceBuy: product.Product_floPriceBuy,
          Product_floProfitPercentage: profitPercentage,
        });
      }

      let globalDiscount = 0;
      if (totalOperation >= 100) {
        globalDiscount = 0.2;
      } else {
        globalDiscount = 0.1;
      }
      const totalWithDiscount = totalOperation * (1 - globalDiscount);

      const sale = this.saleRepository.create({
        Sale_intTotalProductsSold: totalProductsSold,
        Sale_floTotalOperation: totalWithDiscount,
        Sale_dtmtSaleDate: saleDate,
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
