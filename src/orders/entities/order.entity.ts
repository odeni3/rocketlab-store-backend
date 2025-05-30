import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../auth/entities/user.entity';

export class OrderItem {
  @ApiProperty({
    description: 'ID do item do pedido',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 999.99
  })
  price: number;

  @ApiProperty({
    description: 'ID do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  productId: string;

  @ApiProperty({
    description: 'Produto',
    type: () => Product
  })
  product: Product;

  @ApiProperty({
    description: 'ID do pedido',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  orderId: string;
}

export class Order {
  @ApiProperty({
    description: 'ID do pedido',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'Status do pedido',
    example: 'COMPLETED',
    enum: ['COMPLETED']
  })
  status: string;

  @ApiProperty({
    description: 'Valor total do pedido',
    example: 1999.98
  })
  total: number;

  @ApiProperty({
    description: 'ID do usuário que fez o pedido',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  userId: string;

  @ApiProperty({
    description: 'Usuário que fez o pedido',
    type: () => User
  })
  user?: User;

  @ApiProperty({
    description: 'Data de criação do pedido'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do pedido'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItem]
  })
  items: OrderItem[];
} 