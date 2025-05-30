import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { User } from './entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário (público)' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou email já em uso',
  })
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login (público)' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado (admin/user)' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  getProfile(@Request() req): User {
    return req.user;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários do sistema (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [User],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
  })
  getAllUsers(): Promise<User[]> {
    return this.authService.findAllUsers();
  }
} 