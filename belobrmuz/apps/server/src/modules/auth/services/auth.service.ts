import * as bcrypt from 'bcryptjs';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import * as process from 'process';
import { ExceptionAuthMessages } from '../constants/exception-messages';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const userExists = await this.userService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException(ExceptionAuthMessages.USER_ALREADY_EXISTS);
    }

    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async signIn(data: AuthDto) {
    const user = await this.userService.findByUsername(data.username);
    if (!user) throw new BadRequestException(ExceptionAuthMessages.USER_NOT_FOUND);

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException(ExceptionAuthMessages.WRONG_PASSWORD);

    const tokens = await this.getTokens(user.id, user.username);
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

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException(ExceptionAuthMessages.ACCESS_DENIED);

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  hashData(data: string) {
    const rounds = 10
    return bcrypt.hash(data, rounds);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.ACCESS_SECRET,
          expiresIn: process.env.ACCESS_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.REFRESH_SECRET,
          expiresIn: process.env.REFRESH_EXPIRES_IN,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
