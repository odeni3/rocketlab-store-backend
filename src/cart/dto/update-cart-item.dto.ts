import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Nova quantidade do item no carrinho',
    minimum: 0,
    example: 2,
  })
  @IsInt()
  @Min(0)
  quantity: number;
} 