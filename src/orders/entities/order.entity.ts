import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

export class OrderItem {
  @ApiProperty({ description: 'ID do item do pedido' })
  id: number;

  @ApiProperty({ description: 'Quantidade do produto' })
  quantity: number;

  @ApiProperty({ description: 'Preço unitário do produto' })
  price: number;

  @ApiProperty({ description: 'ID do produto' })
  productId: number;

  @ApiProperty({ description: 'Produto', type: () => Product })
  
  @ApiProperty({ description: 'ID do pedido' })
  orderId: number;
}

export class Order {
  @ApiProperty({ description: 'ID do pedido' })
  id: number;

  @ApiProperty({ description: 'Status do pedido' })
  status: string;

  @ApiProperty({ description: 'Valor total do pedido' })
  total: number;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  @ApiProperty({ description: 'Itens do pedido', type: [OrderItem] })
  items: OrderItem[];
}
