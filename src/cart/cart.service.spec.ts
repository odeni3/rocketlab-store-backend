import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock da função mapPrismaCartToCart
jest.mock('../types/prisma.types', () => ({
  mapPrismaCartToCart: jest.fn((cart) => cart),
}));

describe('CartService', () => {
  let service: CartService;

  const mockPrismaService = {
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockProductsService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    const userId = 'user-1';
    const productId = 'product-1';
    const quantity = 2;

    const mockProduct = {
      id: productId,
      name: 'Produto Teste',
      price: 99.99,
      stock: 10,
    };

    const mockCart = {
      id: 'cart-1',
      userId,
      status: 'ACTIVE',
      total: 0,
      items: [],
    };

    it('deve adicionar um novo item ao carrinho', async () => {
      // Arrange
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.create.mockResolvedValue({});
      mockProductsService.update.mockResolvedValue({});

      // Mock para recalculateCart
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [{ productId, quantity, price: 99.99 }],
      });
      mockPrismaService.cart.update.mockResolvedValue(mockCart);

      // Act
      await service.addItem(productId, quantity, userId);

      // Assert
      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId);
      expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
        data: {
          quantity,
          price: mockProduct.price,
          productId,
          cartId: mockCart.id,
        },
      });
      expect(mockProductsService.update).toHaveBeenCalledWith(productId, {
        stock: mockProduct.stock - quantity,
      });
    });

    it('deve lançar BadRequestException para quantidade zero ou negativa', async () => {
      // Arrange
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.addItem(productId, 0, userId)).rejects.toThrow(BadRequestException);
      await expect(service.addItem(productId, -1, userId)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se não houver estoque suficiente', async () => {
      // Arrange
      const lowStockProduct = { ...mockProduct, stock: 1 };
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockProductsService.findOne.mockResolvedValue(lowStockProduct);

      // Act & Assert
      await expect(service.addItem(productId, 5, userId)).rejects.toThrow(BadRequestException);
    });

    it('deve atualizar quantidade se item já existir no carrinho', async () => {
      // Arrange
      const existingItem = {
        id: 'item-1',
        productId,
        quantity: 1,
        price: 99.99,
      };
      const cartWithItem = {
        ...mockCart,
        items: [existingItem],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(cartWithItem);
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.update.mockResolvedValue({});
      mockProductsService.update.mockResolvedValue({});

      // Mock para recalculateCart
      mockPrismaService.cart.findUnique.mockResolvedValue(cartWithItem);
      mockPrismaService.cart.update.mockResolvedValue(cartWithItem);

      // Act
      await service.addItem(productId, quantity, userId);

      // Assert
      expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    });
  });

  describe('updateItemQuantity', () => {
    const itemId = 'item-1';
    const newQuantity = 3;

    const mockCartItem = {
      id: itemId,
      productId: 'product-1',
      quantity: 2,
      price: 99.99,
      cartId: 'cart-1',
      cart: { id: 'cart-1' },
      product: { stock: 10 },
    };

    const mockProduct = {
      id: 'product-1',
      stock: 10,
    };

    it('deve atualizar a quantidade do item', async () => {
      // Arrange
      mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.update.mockResolvedValue({});
      mockProductsService.update.mockResolvedValue({});

      // Mock para recalculateCart
      mockPrismaService.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        items: [],
      });
      mockPrismaService.cart.update.mockResolvedValue({});

      // Act
      await service.updateItemQuantity(itemId, newQuantity);

      // Assert
      expect(mockPrismaService.cartItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: { cart: true, product: true },
      });
      expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: { quantity: newQuantity },
      });
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      // Arrange
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateItemQuantity(itemId, newQuantity)).rejects.toThrow(
        new NotFoundException(`Item ${itemId} não encontrado no carrinho`),
      );
    });

    it('deve remover item se quantidade for zero ou negativa', async () => {
      // Arrange
      mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
      mockProductsService.update.mockResolvedValue({});
      mockPrismaService.cartItem.delete.mockResolvedValue({});

      // Mock para recalculateCart (do removeItem)
      mockPrismaService.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        items: [],
      });
      mockPrismaService.cart.update.mockResolvedValue({});

      // Act
      await service.updateItemQuantity(itemId, 0);

      // Assert
      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });
  });

  describe('removeItem', () => {
    const itemId = 'item-1';

    const mockCartItem = {
      id: itemId,
      productId: 'product-1',
      quantity: 2,
      cartId: 'cart-1',
      product: { stock: 8 },
    };

    it('deve remover um item do carrinho', async () => {
      // Arrange
      mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
      mockProductsService.update.mockResolvedValue({});
      mockPrismaService.cartItem.delete.mockResolvedValue({});

      // Mock para recalculateCart
      mockPrismaService.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        items: [],
      });
      mockPrismaService.cart.update.mockResolvedValue({});

      // Act
      await service.removeItem(itemId);

      // Assert
      expect(mockPrismaService.cartItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: { product: true },
      });
      expect(mockProductsService.update).toHaveBeenCalledWith(mockCartItem.productId, {
        stock: mockCartItem.product.stock + mockCartItem.quantity,
      });
      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      // Arrange
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeItem(itemId)).rejects.toThrow(
        new NotFoundException(`Item ${itemId} não encontrado no carrinho`),
      );
    });
  });

  describe('clear', () => {
    const userId = 'user-1';

    it('deve limpar o carrinho e restaurar o estoque', async () => {
      // Arrange
      const mockCart = {
        id: 'cart-1',
        userId,
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            product: { stock: 8 },
          },
          {
            productId: 'product-2',
            quantity: 1,
            product: { stock: 5 },
          },
        ],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockProductsService.update.mockResolvedValue({});
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({});
      mockPrismaService.cart.update.mockResolvedValue({});

      // Act
      await service.clear(userId);

      // Assert
      expect(mockProductsService.update).toHaveBeenCalledTimes(2);
      expect(mockProductsService.update).toHaveBeenCalledWith('product-1', { stock: 10 });
      expect(mockProductsService.update).toHaveBeenCalledWith('product-2', { stock: 6 });
      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCart.id },
      });
      expect(mockPrismaService.cart.update).toHaveBeenCalledWith({
        where: { id: mockCart.id },
        data: { total: 0 },
      });
    });
  });

  describe('getCart', () => {
    const userId = 'user-1';

    it('deve retornar o carrinho do usuário', async () => {
      // Arrange
      const mockCart = {
        id: 'cart-1',
        userId,
        status: 'ACTIVE',
        total: 199.98,
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            quantity: 2,
            price: 99.99,
          },
        ],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);

      // Act
      const result = await service.getCart(userId);

      // Assert
      expect(mockPrismaService.cart.findFirst).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(mockCart);
    });

    it('deve criar um novo carrinho se não existir', async () => {
      // Arrange
      const newCart = {
        id: 'cart-1',
        userId,
        status: 'ACTIVE',
        total: 0,
        items: [],
      };

      mockPrismaService.cart.findFirst
        .mockResolvedValueOnce(null) // primeira chamada não encontra carrinho
        .mockResolvedValueOnce(newCart); // segunda chamada após criar
      mockPrismaService.cart.create.mockResolvedValue(newCart);

      // Act
      const result = await service.getCart(userId);

      // Assert
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          status: 'ACTIVE',
          total: 0,
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(newCart);
    });
  });
});
