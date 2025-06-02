import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock da função mapPrismaOrderToOrder
jest.mock('../types/prisma.types', () => ({
  mapPrismaOrderToOrder: jest.fn((order) => order),
}));

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar todos os pedidos', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          status: 'COMPLETED',
          total: 199.99,
          createdAt: new Date(),
        },
        {
          id: 'order-2',
          userId: 'user-2',
          status: 'COMPLETED',
          total: 299.99,
          createdAt: new Date(),
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockOrders);
    });

    it('deve lançar NotFoundException se não houver pedidos', async () => {
      // Arrange
      mockPrismaService.order.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(
        new NotFoundException('Nenhum pedido encontrado'),
      );
    });
  });

  describe('findAllByUser', () => {
    it('deve retornar pedidos de um usuário específico', async () => {
      // Arrange
      const userId = 'user-1';
      const mockOrders = [
        {
          id: 'order-1',
          userId,
          status: 'COMPLETED',
          total: 199.99,
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      // Act
      const result = await service.findAllByUser(userId);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
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
      expect(result).toEqual(mockOrders);
    });

    it('deve lançar NotFoundException se usuário não tiver pedidos', async () => {
      // Arrange
      const userId = 'user-1';
      mockPrismaService.order.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(service.findAllByUser(userId)).rejects.toThrow(
        new NotFoundException('Nenhum pedido encontrado para este usuário'),
      );
    });
  });

  describe('findAllBySpecificUser', () => {
    it('deve retornar pedidos de um usuário específico (admin)', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        name: 'João Silva',
        email: 'joao@email.com',
      };
      const mockOrders = [
        {
          id: 'order-1',
          userId,
          status: 'COMPLETED',
          total: 199.99,
        },
      ];
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      // Act
      const result = await service.findAllBySpecificUser(userId);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockOrders);
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findAllBySpecificUser(userId)).rejects.toThrow(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um pedido por ID', async () => {
      // Arrange
      const orderId = 'order-1';
      const mockOrder = {
        id: orderId,
        userId: 'user-1',
        status: 'COMPLETED',
        total: 199.99,
        items: [],
        user: {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@email.com',
        },
      };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act
      const result = await service.findOne(orderId);

      // Assert
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se pedido não for encontrado', async () => {
      // Arrange
      const orderId = 'non-existent-order';
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(orderId)).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );
    });

    it('deve retornar pedido específico do usuário quando userId fornecido', async () => {
      // Arrange
      const orderId = 'order-1';
      const userId = 'user-1';
      const mockOrder = {
        id: orderId,
        userId,
        status: 'COMPLETED',
        total: 199.99,
      };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act
      const result = await service.findOne(orderId, userId);

      // Assert
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se pedido não pertencer ao usuário', async () => {
      // Arrange
      const orderId = 'order-1';
      const userId = 'user-1';
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado para este usuário`),
      );
    });
  });
});
