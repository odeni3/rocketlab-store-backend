import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

export class CartItem {
  @ApiProperty({
    description: 'ID do item do carrinho',
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
    description: 'ID do carrinho',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  cartId: string;
}

export class Cart {
  @ApiProperty({
    description: 'ID do carrinho',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'Status do carrinho',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'COMPLETED']
  })
  status: string;

  @ApiProperty({
    description: 'Valor total do carrinho',
    example: 1999.98
  })
  total: number;

  @ApiProperty({
    description: 'Data de criação do carrinho'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do carrinho'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Itens do carrinho',
    type: [CartItem]
  })
  items: CartItem[];
} 