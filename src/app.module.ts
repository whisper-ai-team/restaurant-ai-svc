import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookService } from './facebook/facebook.service';
import { ApiTokenGuard } from './security/api-token.guard';

@Module({
  controllers: [FacebookController],
  providers: [
    FacebookService,
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
  ],
})
export class AppModule {}
