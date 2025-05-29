import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { mapPrismaProductToProduct } from '../types/prisma.types';
import { ProductCategory } from './enums/product-category.enum';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private validateCategory(category: string): ProductCategory {
    const normalizedCategory = category.trim();
    const validCategory = Object.values(ProductCategory).find(
      cat => cat.toLowerCase() === normalizedCategory.toLowerCase()
    );

    if (!validCategory) {
      throw new BadRequestException(
        `Categoria inválida. As categorias permitidas são: ${Object.values(ProductCategory).join(', ')}`
      );
    }

    return validCategory;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Valida e normaliza a categoria
    const validCategory = this.validateCategory(createProductDto.category);

    // Verifica se já existe um produto com o mesmo nome (case insensitive)
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: {
          contains: createProductDto.name,
        }
      },
    });

    if (existingProduct && existingProduct.name.toLowerCase() === createProductDto.name.toLowerCase()) {
      throw new ConflictException(`Já existe um produto cadastrado com o nome "${existingProduct.name}"`);
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        category: validCategory, // Usa a categoria normalizada
      },
    });
    return mapPrismaProductToProduct(product);
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(mapPrismaProductToProduct);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return mapPrismaProductToProduct(product);
  }

  async update(id: string, updateData: Partial<CreateProductDto>): Promise<Product> {
    // Se estiver atualizando a categoria, valida e normaliza
    if (updateData.category) {
      updateData.category = this.validateCategory(updateData.category);
    }

    // Se estiver tentando atualizar o nome, verifica se já existe outro produto com este nome (case insensitive)
    if (updateData.name) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          name: {
            contains: updateData.name,
          },
          NOT: {
            id: id
          }
        },
      });

      if (existingProduct && existingProduct.name.toLowerCase() === updateData.name.toLowerCase()) {
        throw new ConflictException(`Já existe outro produto cadastrado com o nome "${existingProduct.name}"`);
      }
    }

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
      return mapPrismaProductToProduct(product);
    } catch (error) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
  }

  async findAvailableByCategory(category: string): Promise<Product[]> {
    // Valida e normaliza a categoria
    const validCategory = this.validateCategory(category);

    const products = await this.prisma.product.findMany({
      where: {
        category: validCategory,
        stock: {
          gt: 0
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return products.map(mapPrismaProductToProduct);
  }
}
