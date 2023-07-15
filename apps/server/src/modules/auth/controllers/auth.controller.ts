import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from '../../../common/guards/refresh-token.guard';
import { setRefreshTokenCookie } from '../utils/utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async signin(
    @Body() { fingerprint, ...data }: AuthDto & any,
    @Res() res: Response
  ) {
    const result = await this.authService.signIn(data, fingerprint);
    setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logout(@Body() fingerprint, @Req() req: Request) {
    this.authService.logout(req.user['sub'], req.user['token'], fingerprint);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Body() { fingerprint },
    @Req() req: Request,
    @Res() res: Response
  ) {
    const result = await this.authService.refreshTokens(
      req.user['sub'],
      req.user['token'],
      fingerprint
    );
    setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }
}
