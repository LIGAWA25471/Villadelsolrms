import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('branch')
  @UseGuards(AuthGuard('jwt'))
  async getBranch(@Request() req) {
    const branch = await this.authService.getBranchContext(req.user.userId);
    return branch;
  }
}
