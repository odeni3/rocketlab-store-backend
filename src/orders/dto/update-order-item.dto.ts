import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderItemDto {
  @ApiProperty({
    description: 'Nova quantidade do item no carrinho',
    minimum: 0,
  })
  quantity: number;
} 