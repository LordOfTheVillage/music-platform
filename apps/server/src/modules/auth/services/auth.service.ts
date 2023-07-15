import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { exceptionAuthMessages } from '../constants/exception-messages';
import { TokenService } from './token.service';
import { JwtPayload, JwtTokens } from '../../../common/types/jwt.type';
import { User } from '../../user/models/user.model';
import { MailService } from '../../mail/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { RefreshSessionService } from '../../refresh-session/services/refresh-session.service';

@Injectable()
export class AuthService {
  private readonly verificationUrl = `auth/verify/`;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly refreshSessionService: RefreshSessionService
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const userExists = await this.userService.findByUsername(
      createUserDto.username
    );
    if (userExists)
      throw new BadRequestException(exceptionAuthMessages.USER_ALREADY_EXISTS);

    const token = await this.tokenService.getVerificationToken({
      email: createUserDto.email,
    });

    const hash = await this.tokenService.hashData(createUserDto.password);
    const newUser = await this.userService.create(
      {
        ...createUserDto,
        password: hash,
      },
      token
    );

    await this.sendVerificationEmail(newUser, token);
  }

  async signIn(data: AuthDto, fingerprint: string) {
    if (!fingerprint)
      throw new BadRequestException(exceptionAuthMessages.NO_FINGERPRINT);

    const session =
      await this.refreshSessionService.findRefreshSessionByFingerprint(
        fingerprint
      );
    if (session)
      await this.refreshSessionService.removeRefreshSession(
        session.refreshToken
      );

    const user = await this.userService.findByEmail(data.email);
    if (!user)
      throw new BadRequestException(exceptionAuthMessages.USER_NOT_FOUND);

    const passwordMatches = await this.tokenService.matchHash(
      data.password,
      user.password
    );
    if (!passwordMatches)
      throw new BadRequestException(exceptionAuthMessages.WRONG_PASSWORD);

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );
    await this.refreshSessionService.createRefreshSession({
      refreshToken: tokens.refreshToken,
      userId: user.id,
      fingerprint,
    });
    return tokens;
  }

  async logout(id: number, refreshToken: string, fingerprint: string) {
    const refreshSession = await this.refreshSessionService.findRefreshSession(
      refreshToken
    );

    if (refreshSession.fingerprint !== fingerprint)
      throw new ForbiddenException(
        exceptionAuthMessages.INVALID_REFRESH_SESSION
      );

    if (!refreshSession)
      throw new ForbiddenException(exceptionAuthMessages.ACCESS_DENIED);

    await this.refreshSessionService.removeRefreshSession(refreshToken);
  }

  async refreshTokens(id: number, refreshToken: string, fingerprint: string) {
    const user = await this.userService.findById(id);
    if (!user)
      throw new ForbiddenException(exceptionAuthMessages.ACCESS_DENIED);

    const refreshSession = await this.refreshSessionService.findRefreshSession(
      refreshToken
    );

    if (!refreshSession)
      throw new ForbiddenException(exceptionAuthMessages.ACCESS_DENIED);

    await this.refreshSessionService.removeRefreshSession(refreshToken);

    if (
      Number(refreshSession.userId) !== user.id ||
      refreshSession.fingerprint !== fingerprint
    )
      throw new ForbiddenException(
        exceptionAuthMessages.INVALID_REFRESH_SESSION
      );

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );

    await this.refreshSessionService.createRefreshSession({
      ...refreshSession,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `${this.configService.getOrThrow('EMAIL_URL')}${
      this.verificationUrl
    }${token}`;
    await this.mailService.sendConfirmationMail(user, token, url);
  }

  async verifyUser(token: string, fingerprint: string): Promise<JwtTokens> {
    if (!fingerprint)
      throw new BadRequestException(exceptionAuthMessages.NO_FINGERPRINT);

    const user = await this.userService.findByVerificationToken(token);
    if (!user)
      throw new BadRequestException(exceptionAuthMessages.USER_NOT_FOUND);

    await this.userService.updateConfirmationStatus(user.id, true);

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );

    await this.refreshSessionService.createRefreshSession({
      refreshToken: tokens.refreshToken,
      userId: user.id,
      fingerprint,
    });
    return tokens;
  }

  generateUserTokenData(user: User): JwtPayload {
    return {
      sub: `${user.id}`,
      username: user.username,
      email: user.email,
    };
  }
}
