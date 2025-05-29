import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsPositive } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2
  })
  @IsInt()
  @IsPositive()
  quantity: number;
} 