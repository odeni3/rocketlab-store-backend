import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto' })
  name: string;

  @ApiProperty({ description: 'Descrição do produto' })
  description: string;

  @ApiProperty({ description: 'Preço do produto' })
  price: number;

  @ApiProperty({ description: 'Quantidade em estoque' })
  stock: number;
}
