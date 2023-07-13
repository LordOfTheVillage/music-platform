import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../user/models/user.model';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendConfirmationMail(user: User, token: string, url: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Продолжение регистрации на платформе холдинга "Белобрмуз" !',
      template: './confirmation',
      context: {
        name: user.username,
        url,
      },
    });
  }
}
