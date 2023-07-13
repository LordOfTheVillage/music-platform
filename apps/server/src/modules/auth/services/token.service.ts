import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

type EncryptedData = Record<string, string | number>;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
  }

  async getTokens(encryptedData: EncryptedData) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(
        encryptedData,
        this.configService.getOrThrow('ACCESS_SECRET'),
        this.configService.getOrThrow('ACCESS_EXPIRES_IN')
      ),
      this.generateToken(
        encryptedData,
        this.configService.getOrThrow('REFRESH_SECRET'),
        this.configService.getOrThrow('REFRESH_EXPIRES_IN')
      )
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  getVerificationToken(encryptedData: EncryptedData) {
    return this.generateToken(
      encryptedData,
      this.configService.getOrThrow('VERIFICATION_SECRET'),
      this.configService.getOrThrow('VERIFICATION_EXPIRES_IN')
    );
  }

  generateToken(
    encryptedData: EncryptedData,
    secret: string,
    expiresIn: string
  ) {
    return this.jwtService.signAsync(
      { ...encryptedData },
      {
        secret,
        expiresIn
      }
    );
  }

  hashData(data: string) {
    const rounds = 10;
    return bcrypt.hash(data, rounds);
  }

  async matchHash(data: string, hash: string) {
    return bcrypt.compare(data, hash);
  }
}
