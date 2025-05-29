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
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obter o carrinho ativo' })
  @ApiResponse({
    status: 200,
    description: 'Carrinho retornado com sucesso',
    type: Cart,
  })
  getCart() {
    return this.cartService.getCart();
  }

  @Post('items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({
    status: 200,
    description: 'Item adicionado com sucesso',
    type: Cart,
  })
  addItem(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(addToCartDto.productId, addToCartDto.quantity);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade de um item no carrinho' })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso',
    type: Cart,
  })
  updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(itemId, updateCartItemDto.quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  @ApiResponse({
    status: 200,
    description: 'Item removido com sucesso',
    type: Cart,
  })
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Limpar o carrinho' })
  @ApiResponse({
    status: 204,
    description: 'Carrinho limpo com sucesso',
  })
  clear() {
    return this.cartService.clear();
  }

  @Post('checkout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Finalizar compra' })
  @ApiResponse({
    status: 204,
    description: 'Compra finalizada com sucesso',
  })
  checkout() {
    return this.cartService.checkout();
  }
} 