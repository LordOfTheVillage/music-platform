import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/models/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { EmailConfirmation } from './modules/user/models/email-confirmation.model';
import { ScheduledTasksModule } from './modules/scheduled-tasks/scheduled-tasks.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RefreshSessionModule } from './modules/refresh-session/refresh-session.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('POSTGRES_HOST'),
        port: config.getOrThrow<number>('POSTGRES_PORT'),
        username: config.getOrThrow('POSTGRES_USER'),
        password: config.getOrThrow('POSTGRES_PASSWORD'),
        database: config.getOrThrow('POSTGRES_DB'),
        entities: [User, EmailConfirmation],
        synchronize: true,
        logging: false,
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          host: config.getOrThrow('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
        },
      }),
    }),
    UserModule,
    AuthModule,
    RefreshSessionModule,
    MailModule,
    ScheduledTasksModule,
  ],
  providers: [],
})
export class AppModule {}
