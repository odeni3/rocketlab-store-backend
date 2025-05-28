import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { Order } from './entities/order.entity';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(data: {
    items: { productId: number; quantity: number }[];
  }): Promise<Order> {
    if (data.items.length === 0) {
      throw new BadRequestException('O carrinho não pode estar vazio');
    }

    // Primeiro, vamos validar todos os produtos e calcular o total
    const itemsWithProducts = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);

        if (item.quantity <= 0) {
          throw new BadRequestException(
            `A quantidade do produto ${product.name} deve ser maior que zero`,
          );
        }

        if (product.price <= 0) {
          throw new BadRequestException(
            `O produto ${product.name} está com preço inválido`,
          );
        }

        if (product.stock === 0) {
          throw new BadRequestException(
            `O produto ${product.name} está fora de estoque`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}`,
          );
        }

        return {
          ...item,
          product,
          subtotal: product.price * item.quantity,
        };
      }),
    );

    const total = itemsWithProducts.reduce((sum, item) => sum + item.subtotal, 0);

    // Criar o pedido com os itens validados
    const order = await this.prisma.order.create({
      data: {
        total,
        status: 'PENDING',
        items: {
          create: itemsWithProducts.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Atualizar o estoque dos produtos
    await Promise.all(
      itemsWithProducts.map((item) =>
        this.productsService.update(item.productId, {
          stock: item.product.stock - item.quantity,
        }),
      ),
    );

    return order;
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado');
    }

    return orders;
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return order;
  }

  async updateOrderItem(orderId: number, itemId: number, updateData: UpdateOrderItemDto): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    }

    const item = order.items.find(item => item.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no pedido ${orderId}`);
    }

    if (updateData.quantity === 0) {
      // Remover o item do carrinho
      await this.prisma.orderItem.delete({
        where: { id: itemId },
      });
    } else {
      // Validar estoque
      const product = await this.productsService.findOne(item.productId);
      const stockDifference = updateData.quantity - item.quantity;

      if (product.stock < stockDifference) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}`,
        );
      }

      // Atualizar quantidade e preço
      await this.prisma.orderItem.update({
        where: { id: itemId },
        data: {
          quantity: updateData.quantity,
        },
      });

      // Atualizar estoque do produto
      await this.productsService.update(item.productId, {
        stock: product.stock - stockDifference,
      });
    }

    // Recalcular total do pedido
    const updatedOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const newTotal = updatedOrder!.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return this.prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async clearCart(orderId: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    }

    // Restaurar estoque dos produtos
    for (const item of order.items) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.update(item.productId, {
        stock: product.stock + item.quantity,
      });
    }

    // Remover todos os itens do pedido
    await this.prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Atualizar total do pedido para zero
    await this.prisma.order.update({
      where: { id: orderId },
      data: { total: 0 },
    });
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    }

    const item = order.items.find(item => item.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no pedido ${orderId}`);
    }

    // Restaurar estoque do produto
    const product = await this.productsService.findOne(item.productId);
    await this.productsService.update(item.productId, {
      stock: product.stock + item.quantity,
    });

    // Remover o item
    await this.prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Recalcular total do pedido
    const updatedOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const newTotal = updatedOrder!.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return this.prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async deleteOrder(orderId: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} não encontrado`);
    }

    // Restaurar estoque dos produtos
    for (const item of order.items) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.update(item.productId, {
        stock: product.stock + item.quantity,
      });
    }

    // Excluir o pedido (isso também excluirá automaticamente os itens devido à exclusão em cascata)
    await this.prisma.order.delete({
      where: { id: orderId },
    });
  }

  async deleteAllOrders(): Promise<void> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
    });

    // Restaurar estoque de todos os produtos em todos os pedidos
    for (const order of orders) {
      for (const item of order.items) {
        const product = await this.productsService.findOne(item.productId);
        await this.productsService.update(item.productId, {
          stock: product.stock + item.quantity,
        });
      }
    }

    // Excluir todos os pedidos
    await this.prisma.order.deleteMany({});
  }
}
