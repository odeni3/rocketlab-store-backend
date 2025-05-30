import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário',
    type: User
  })
  user: User;
} 