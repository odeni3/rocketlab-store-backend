import { Controller, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Order } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos finalizados' })
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
  @ApiParam({
    name: 'id',
    description: 'ID único do pedido',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
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
    return this.ordersService.findOne(id);
  }
} 