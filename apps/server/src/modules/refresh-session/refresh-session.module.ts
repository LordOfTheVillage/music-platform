import { Module } from '@nestjs/common';
import { RefreshSessionService } from './services/refresh-session.service';

@Module({
  imports: [],
  providers: [RefreshSessionService],
  exports: [RefreshSessionService],
})
export class RefreshSessionModule {}
