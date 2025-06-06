import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, Min, MinLength, IsEnum } from 'class-validator';
import { ProductCategory } from '../enums/product-category.enum';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Smartphone XYZ',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Um smartphone incrível com recursos avançados',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Preço do produto (deve ser maior que zero)',
    example: 999.99,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'O preço deve ser maior que zero' })
  price: number;

  @ApiProperty({
    description: 'Quantidade em estoque (deve ser maior que zero)',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'O estoque deve ser maior que zero' })
  stock: number;

  @ApiProperty({
    description: 'Categoria do produto',
    enum: ProductCategory,
    example: ProductCategory.COMPUTERS,
    enumName: 'ProductCategory'
  })
  @IsEnum(ProductCategory, {
    message: 'Categoria inválida. As categorias permitidas são: Computadores e Notebooks, Periféricos, Componentes de Hardware, Dispositivos de Mídia, Games'
  })
  category: ProductCategory;
}
