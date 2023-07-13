import {
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { ExceptionAuthMessages } from '../constants/exception-messages';
import { TokenService } from './token.service';
import { JwtPayload, JwtTokens } from '../../../common/types/jwt.type';
import { User } from '../../user/models/user.model';
import { MailService } from '../../mail/services/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {
  }

  async signUp(createUserDto: CreateUserDto) {
    const userExists = await this.userService.findByUsername(
      createUserDto.username
    );
    if (userExists) {
      throw new BadRequestException(ExceptionAuthMessages.USER_ALREADY_EXISTS);
    }

    const token = await this.tokenService.getVerificationToken({
      email: createUserDto.email
    });

    const hash = await this.tokenService.hashData(createUserDto.password);
    const newUser = await this.userService.create(
      {
        ...createUserDto,
        password: hash
      },
      token
    );

    await this.sendVerificationEmail(newUser, token);
  }

  async signIn(data: AuthDto) {
    const user = await this.userService.findByEmail(data.email);
    if (!user)
      throw new BadRequestException(ExceptionAuthMessages.USER_NOT_FOUND);

    const passwordMatches = await this.tokenService.matchHash(
      data.password,
      user.password
    );
    if (!passwordMatches)
      throw new BadRequestException(ExceptionAuthMessages.WRONG_PASSWORD);

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.userService.findById(id);
    if (!user || !user.refreshToken)
      throw new ForbiddenException(ExceptionAuthMessages.ACCESS_DENIED);

    const refreshTokenMatches = await this.tokenService.matchHash(
      refreshToken,
      user.refreshToken
    );
    if (!refreshTokenMatches)
      throw new ForbiddenException(ExceptionAuthMessages.ACCESS_DENIED);

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.tokenService.hashData(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken
    });
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `${this.configService.getOrThrow('EMAIL_URL')}/auth/verify/${token}`;
    await this.mailService.sendConfirmationMail(user, token, url);
  }

  async verifyUser(token: string): Promise<JwtTokens> {
    const user = await this.userService.findByVerificationToken(token);
    if (!user)
      throw new BadRequestException(ExceptionAuthMessages.USER_NOT_FOUND);

    await this.userService.updateConfirmationStatus(user, true);

    const tokens = await this.tokenService.getTokens(
      this.generateUserTokenData(user)
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  generateUserTokenData(user: User): JwtPayload {
    return {
      sub: `${user.id}`,
      username: user.username,
      email: user.email
    };
  }
}
