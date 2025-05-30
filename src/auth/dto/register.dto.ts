import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsIn, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
    minLength: 2
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role do usuário (ADMIN ou USER)',
    example: 'USER',
    enum: ['ADMIN', 'USER']
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().toUpperCase())
  @IsIn(['ADMIN', 'USER'], {
    message: 'Role deve ser ADMIN ou USER'
  })
  role: string;
} 