import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Order } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    type: Order,
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    type: [Order],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado',
  })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado com sucesso',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade de um item no carrinho' })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou item não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Quantidade inválida ou estoque insuficiente',
  })
  updateOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(+orderId, +itemId, updateOrderItemDto);
  }

  @Delete(':orderId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  @ApiResponse({
    status: 204,
    description: 'Item removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou item não encontrado',
  })
  removeOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.removeOrderItem(+orderId, +itemId);
  }

  @Delete(':orderId/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Limpar o carrinho (remover todos os itens)' })
  @ApiResponse({
    status: 204,
    description: 'Carrinho limpo com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  clearCart(@Param('orderId') orderId: string) {
    return this.ordersService.clearCart(+orderId);
  }

  @Delete(':orderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um pedido específico' })
  @ApiResponse({
    status: 204,
    description: 'Pedido excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  async deleteOrder(@Param('orderId') orderId: string) {
    await this.ordersService.deleteOrder(+orderId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir todos os pedidos' })
  @ApiResponse({
    status: 204,
    description: 'Todos os pedidos foram excluídos com sucesso',
  })
  async deleteAllOrders() {
    await this.ordersService.deleteAllOrders();
  }
}
