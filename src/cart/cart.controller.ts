import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obter o carrinho ativo (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Carrinho retornado com sucesso',
    type: Cart,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Item adicionado com sucesso',
    type: Cart,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  addItem(@Body() addToCartDto: AddToCartDto, @Request() req) {
    return this.cartService.addItem(addToCartDto.productId, addToCartDto.quantity, req.user.id);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade de um item no carrinho (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso',
    type: Cart,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(itemId, updateCartItemDto.quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remover um item do carrinho (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Item removido com sucesso',
    type: Cart,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Limpar o carrinho (admin/user)' })
  @ApiResponse({
    status: 204,
    description: 'Carrinho limpo com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  clear(@Request() req) {
    return this.cartService.clear(req.user.id);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Finalizar compra (admin/user)' })
  @ApiResponse({
    status: 204,
    description: 'Compra finalizada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  checkout(@Request() req) {
    return this.cartService.checkout(req.user.id);
  }
}
