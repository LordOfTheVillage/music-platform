import { Module } from '@nestjs/common';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { MailModule } from '../mail/mail.module';
import { VerificationController } from './controllers/verification.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}), UserModule, MailModule],
  controllers: [AuthController, VerificationController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokenService,
    ConfigService
  ]
})
export class AuthModule {
}
