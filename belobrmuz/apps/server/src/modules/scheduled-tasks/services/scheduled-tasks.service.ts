import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class ScheduledTasksService {
  constructor(private readonly userService: UserService) {}

  @Cron('*/10 * * * * *')
  async clearUnverifiedUsers() {
    const unverifiedUsers = await this.userService.findUnverified();
    console.log('Clearing unverified users', unverifiedUsers);
    await Promise.all(
      unverifiedUsers.map((user) => this.userService.remove(user.id))
    );
  }
}
