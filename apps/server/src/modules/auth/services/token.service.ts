import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import process from 'process';
import * as bcrypt from 'bcryptjs';

type EncryptedData = Record<string, string | number>;

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async getTokens(encryptedData: EncryptedData) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(
        encryptedData,
        process.env.ACCESS_SECRET,
        process.env.ACCESS_EXPIRES_IN
      ),
      this.generateToken(
        encryptedData,
        process.env.REFRESH_SECRET,
        process.env.REFRESH_EXPIRES_IN
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getVerificationToken(encryptedData: EncryptedData) {
    return this.generateToken(
      encryptedData,
      process.env.VERIFICATION_SECRET,
      process.env.VERIFICATION_EXPIRES_IN
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
        expiresIn,
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
