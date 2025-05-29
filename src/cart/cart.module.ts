import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ProductsModule],
  controllers: [CartController],
  providers: [CartService, PrismaService],
})
export class CartModule {} 