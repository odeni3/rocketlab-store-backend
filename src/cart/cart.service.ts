import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { Cart } from './entities/cart.entity';
import { mapPrismaCartToCart } from '../types/prisma.types';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  private async getOrCreateActiveCart(): Promise<Cart> {
    // Procura por um carrinho ativo
    let cart = await this.prisma.cart.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Se não existir, cria um novo
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          status: 'ACTIVE',
          total: 0,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return mapPrismaCartToCart(cart);
  }

  async addItem(productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateActiveCart();
    const product = await this.productsService.findOne(productId);

    if (quantity <= 0) {
      throw new BadRequestException(
        `A quantidade do produto ${product.name} deve ser maior que zero`,
      );
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}`,
      );
    }

    // Verifica se o item já existe no carrinho
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Atualiza a quantidade do item existente
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Cria um novo item no carrinho
      await this.prisma.cartItem.create({
        data: {
          quantity,
          price: product.price,
          productId,
          cartId: cart.id,
        },
      });
    }

    // Atualiza o estoque do produto
    await this.productsService.update(productId, {
      stock: product.stock - quantity,
    });

    // Recalcula o total do carrinho
    return this.recalculateCart(cart.id);
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    if (quantity <= 0) {
      // Remove o item se a quantidade for 0 ou negativa
      return this.removeItem(itemId);
    }

    const product = await this.productsService.findOne(cartItem.productId);
    const quantityDifference = quantity - cartItem.quantity;

    if (product.stock < quantityDifference) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Atualiza o estoque do produto
    await this.productsService.update(cartItem.productId, {
      stock: product.stock - quantityDifference,
    });

    return this.recalculateCart(cartItem.cartId);
  }

  async removeItem(itemId: string): Promise<Cart> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    // Restaura o estoque do produto
    await this.productsService.update(cartItem.productId, {
      stock: cartItem.product.stock + cartItem.quantity,
    });

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.recalculateCart(cartItem.cartId);
  }

  async clear(): Promise<void> {
    const cart = await this.getOrCreateActiveCart();

    // Restaura o estoque de todos os produtos
    for (const item of cart.items) {
      await this.productsService.update(item.productId, {
        stock: item.product.stock + item.quantity,
      });
    }

    // Remove todos os itens do carrinho
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Atualiza o total do carrinho
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { total: 0 },
    });
  }

  async checkout(): Promise<void> {
    const cart = await this.getOrCreateActiveCart();

    if (cart.items.length === 0) {
      throw new BadRequestException('O carrinho está vazio');
    }

    // Cria um novo pedido com os itens do carrinho
    await this.prisma.order.create({
      data: {
        total: cart.total,
        items: {
          create: cart.items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })),
        },
      },
    });

    // Marca o carrinho como completado
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'COMPLETED' },
    });

    // Remove todos os itens do carrinho (não precisa restaurar estoque pois os produtos já foram "vendidos")
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  private async recalculateCart(cartId: string): Promise<Cart> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Carrinho não encontrado`);
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const updatedCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return mapPrismaCartToCart(updatedCart);
  }

  async getCart(): Promise<Cart> {
    return this.getOrCreateActiveCart();
  }
} 