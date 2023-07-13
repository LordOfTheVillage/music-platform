import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class VerificationController {
  constructor(private authService: AuthService) {}

  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.authService.verifyUser(token);
  }
}
