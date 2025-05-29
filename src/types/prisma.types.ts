import { Prisma } from '@prisma/client';
import { Product } from '../products/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Order } from '../orders/entities/order.entity';
import { Product as PrismaProduct } from '@prisma/client';
import { ProductCategory } from '../products/enums/product-category.enum';

export type PrismaCart = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type PrismaOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export function mapPrismaProductToProduct(prismaProduct: PrismaProduct): Product {
  const product = new Product();
  product.id = prismaProduct.id;
  product.name = prismaProduct.name;
  product.description = prismaProduct.description;
  product.price = prismaProduct.price;
  product.stock = prismaProduct.stock;
  product.category = prismaProduct.category as ProductCategory;
  product.createdAt = prismaProduct.createdAt;
  product.updatedAt = prismaProduct.updatedAt;
  return product;
}

export function mapPrismaCartToCart(prismaCart: PrismaCart): Cart {
  return {
    ...prismaCart,
    items: prismaCart.items.map(item => ({
      ...item,
      product: mapPrismaProductToProduct(item.product),
    })),
  };
}

export function mapPrismaOrderToOrder(prismaOrder: PrismaOrder): Order {
  return {
    ...prismaOrder,
    items: prismaOrder.items.map(item => ({
      ...item,
      product: mapPrismaProductToProduct(item.product),
    })),
  };
} 