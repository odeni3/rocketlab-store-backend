import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ description: 'ID do produto' })
  productId: number;

  @ApiProperty({ description: 'Quantidade do produto' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemDto],
  })
  items: OrderItemDto[];
}
