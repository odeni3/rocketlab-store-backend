import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Order } from './entities/order.entity';
import { mapPrismaOrderToOrder, PrismaOrderWithUser } from '../types/prisma.types';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado para este usuário');
    }

    return orders.map(mapPrismaOrderToOrder);
  }

  async findAllBySpecificUser(userId: string): Promise<Order[]> {
    // Primeiro verifica se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException(`Nenhum pedido encontrado para o usuário ${user.name} (${user.email})`);
    }

    return orders.map(mapPrismaOrderToOrder);
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado');
    }

    return orders.map(mapPrismaOrderToOrder);
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const whereClause: any = { id };
    
    // Se um userId for fornecido, adiciona ao filtro para garantir que o usuário só acesse seus próprios pedidos
    if (userId) {
      whereClause.userId = userId;
    }

    const order = await this.prisma.order.findUnique({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado${userId ? ' para este usuário' : ''}`);
    }

    return mapPrismaOrderToOrder(order);
  }
} 