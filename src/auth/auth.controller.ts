import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Role } from '../common/enums/role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('demo/admin')
  @ApiOperation({ summary: 'Demo login as Admin' })
  demoAdmin() {
    return this.authService.demoLogin(Role.ADMIN);
  }

  @Post('demo/manager')
  @ApiOperation({ summary: 'Demo login as Project Manager' })
  demoManager() {
    return this.authService.demoLogin(Role.PROJECT_MANAGER);
  }

  @Post('demo/member')
  @ApiOperation({ summary: 'Demo login as Team Member' })
  demoMember() {
    return this.authService.demoLogin(Role.TEAM_MEMBER);
  }
}
