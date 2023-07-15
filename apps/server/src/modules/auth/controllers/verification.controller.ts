import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Response } from 'express';
import { setRefreshTokenCookie } from '../utils/utils';

@Controller('auth')
export class VerificationController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify/:token')
  async verify(
    @Param('token') token: string,
    @Body() { fingerprint },
    @Res() res: Response
  ) {
    const result = await this.authService.verifyUser(token, fingerprint);
    setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }
}
