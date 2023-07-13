import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ScheduleModule.forRoot(), UserModule],
  providers: [ScheduledTasksService]
})
export class ScheduledTasksModule {
}
