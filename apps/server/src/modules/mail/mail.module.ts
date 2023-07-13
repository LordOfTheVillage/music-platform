import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './services/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('EMAIL_HOST'),
          port: config.getOrThrow('EMAIL_PORT'),
          secure: false,
          auth: {
            user: config.getOrThrow('EMAIL_ADDRESS'),
            pass: config.getOrThrow('EMAIL_PASSWORD')
          }
        },
        defaults: {
          from: '"Холдинг "Белобрмуз"" <noreply@example.com>'
        },
        template: {
          dir: join(
            process.cwd(),
            'apps',
            'server',
            'src',
            'modules',
            'mail',
            'templates'
          ),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {
}
