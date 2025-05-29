import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../enums/product-category.enum';

export class Product {
  @ApiProperty({
    description: 'ID do produto',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Smartphone XYZ'
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Um smartphone incrível com recursos avançados'
  })
  description: string;

  @ApiProperty({
    description: 'Preço do produto',
    example: 999.99
  })
  price: number;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 50
  })
  stock: number;

  @ApiProperty({
    description: 'Categoria do produto',
    enum: ProductCategory,
    example: ProductCategory.COMPUTERS,
    enumName: 'ProductCategory'
  })
  category: ProductCategory;

  @ApiProperty({
    description: 'Data de criação'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização'
  })
  updatedAt: Date;
}
