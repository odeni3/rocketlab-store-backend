import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty({
    description: 'ID do usuário',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva'
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com'
  })
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: 'USER',
    enum: ['ADMIN', 'USER']
  })
  role: string;

  @ApiProperty({
    description: 'Data de criação'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização'
  })
  updatedAt: Date;
} 