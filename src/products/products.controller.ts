import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { ProductCategory } from './enums/product-category.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo produto (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    type: Product,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem criar produtos.',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Buscar produtos disponíveis por categoria (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos da categoria retornada com sucesso',
    type: [Product],
  })
  @ApiResponse({
    status: 400,
    description: 'Categoria inválida',
  })
  findByCategory(@Param('category') category: string) {
    return this.productsService.findAvailableByCategory(category);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um produto pelo ID (admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID único do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
  })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um produto (admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID único do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem atualizar produtos.',
  })
  update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um produto (admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID único do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiResponse({
    status: 204,
    description: 'Produto removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem remover produtos.',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
