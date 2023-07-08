import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/models/user.model';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { EmailConfirmation } from './modules/user/models/email-confirmation.model';
import { ScheduledTasksModule } from './modules/scheduled-tasks/scheduled-tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, EmailConfirmation],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    MailModule,
    ScheduledTasksModule,
  ],
  providers: [],
})
export class AppModule {}
