import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pedidos do usuário autenticado (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos do usuário retornada com sucesso',
    type: [Order],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado para este usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  findMyOrders(@Request() req) {
    return this.ordersService.findAllByUser(req.user.id);
  }

  @Get('my-orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um pedido específico do usuário autenticado pelo ID (admin/user)' })
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
    description: 'Pedido não encontrado para este usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  findMyOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pedidos (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    type: [Order],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
  })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar todos os pedidos de um usuário específico (admin)' })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos do usuário retornada com sucesso',
    type: [Order],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado ou nenhum pedido encontrado para este usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
  })
  findOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.findAllBySpecificUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um pedido pelo ID (admin)' })
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
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
} 