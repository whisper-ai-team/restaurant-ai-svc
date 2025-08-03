import { Module } from '@nestjs/common';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookService } from './facebook/facebook.service';

@Module({
  controllers: [FacebookController],
  providers: [FacebookService],
})
export class AppModule {}
