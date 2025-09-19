import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookService } from './facebook/facebook.service';
import { SocialPostsController } from './social-posts/social-posts.controller';
import { SocialPostsService } from './social-posts/social-posts.service';
import { ApiTokenGuard } from './security/api-token.guard';

@Module({
  controllers: [FacebookController, SocialPostsController],
  providers: [
    FacebookService,
    SocialPostsService,
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
  ],
})
export class AppModule {}
