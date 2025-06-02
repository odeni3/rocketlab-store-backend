import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProductCategory } from './enums/product-category.enum';

// Mock da função mapPrismaProductToProduct
jest.mock('../types/prisma.types', () => ({
  mapPrismaProductToProduct: jest.fn((product) => product),
}));

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto = {
      name: 'Produto Teste',
      description: 'Descrição do produto',
      price: 99.99,
      stock: 10,
      category: ProductCategory.COMPUTERS,
    };

    it('deve criar um produto com sucesso', async () => {
      // Arrange
      const mockProduct = {
        id: 'product-1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.findFirst.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            contains: createProductDto.name,
          },
        },
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar BadRequestException para categoria inválida', async () => {
      // Arrange
      const invalidDto = { ...createProductDto, category: 'categoria-inexistente' as any };

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se produto com mesmo nome já existir', async () => {
      // Arrange
      const existingProduct = {
        id: 'existing-product',
        name: 'Produto Teste',
        category: ProductCategory.COMPUTERS,
      };
      mockPrismaService.product.findFirst.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.create(createProductDto)).rejects.toThrow(
        new ConflictException('Já existe um produto cadastrado com o nome "Produto Teste"'),
      );
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os produtos', async () => {
      // Arrange
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Produto 1',
          description: 'Descrição 1',
          price: 99.99,
          stock: 10,
          category: ProductCategory.COMPUTERS,
        },
        {
          id: 'product-2',
          name: 'Produto 2',
          description: 'Descrição 2',
          price: 199.99,
          stock: 5,
          category: ProductCategory.PERIPHERALS,
        },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });

    it('deve retornar array vazio se não houver produtos', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto por ID', async () => {
      // Arrange
      const productId = 'product-1';
      const mockProduct = {
        id: productId,
        name: 'Produto Teste',
        description: 'Descrição',
        price: 99.99,
        stock: 10,
        category: ProductCategory.COMPUTERS,
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findOne(productId);

      // Assert
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se produto não for encontrado', async () => {
      // Arrange
      const productId = 'non-existent-product';
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(productId)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
    });
  });

  describe('update', () => {
    const productId = 'product-1';
    const updateData = {
      name: 'Produto Atualizado',
      price: 149.99,
    };

    it('deve atualizar um produto com sucesso', async () => {
      // Arrange
      const updatedProduct = {
        id: productId,
        ...updateData,
        description: 'Descrição',
        stock: 10,
        category: ProductCategory.COMPUTERS,
      };

      mockPrismaService.product.findFirst.mockResolvedValue(null);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(productId, updateData);

      // Assert
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('deve lançar NotFoundException se produto não existir', async () => {
      // Arrange
      const error = new Error('Record not found');
      mockPrismaService.product.update.mockRejectedValue(error);

      // Act & Assert
      await expect(service.update(productId, updateData)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
    });

    it('deve lançar ConflictException se nome já existir em outro produto', async () => {
      // Arrange
      const existingProduct = {
        id: 'other-product',
        name: 'Produto Atualizado',
      };
      mockPrismaService.product.findFirst.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.update(productId, updateData)).rejects.toThrow(
        new ConflictException('Já existe outro produto cadastrado com o nome "Produto Atualizado"'),
      );
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um produto com sucesso', async () => {
      // Arrange
      const productId = 'product-1';
      mockPrismaService.product.delete.mockResolvedValue({});

      // Act
      await service.remove(productId);

      // Assert
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('deve lançar NotFoundException se produto não existir', async () => {
      // Arrange
      const productId = 'non-existent-product';
      const error = new Error('Record not found');
      mockPrismaService.product.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(productId)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
    });
  });

  describe('findAvailableByCategory', () => {
    it('deve retornar produtos disponíveis por categoria', async () => {
      // Arrange
      const category = 'Computadores e Notebooks';
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Produto 1',
          stock: 5,
          category: ProductCategory.COMPUTERS,
        },
        {
          id: 'product-2',
          name: 'Produto 2',
          stock: 10,
          category: ProductCategory.COMPUTERS,
        },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      // Act
      const result = await service.findAvailableByCategory(category);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          category: ProductCategory.COMPUTERS,
          stock: { gt: 0 },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('deve lançar BadRequestException para categoria inválida', async () => {
      // Arrange
      const invalidCategory = 'categoria-inexistente';

      // Act & Assert
      await expect(service.findAvailableByCategory(invalidCategory)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });
  });
});
