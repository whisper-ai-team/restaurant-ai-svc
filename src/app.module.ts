import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BrandController } from './brand/brand.controller';
import { BrandService } from './brand/brand.service';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookService } from './facebook/facebook.service';
import { SocialPostsController } from './social-posts/social-posts.controller';
import { SocialPostsService } from './social-posts/social-posts.service';
import { ApiTokenGuard } from './security/api-token.guard';

@Module({
  controllers: [FacebookController, SocialPostsController, BrandController],
  providers: [
    FacebookService,
    SocialPostsService,
    BrandService,
    {
      provide: APP_GUARD,
      useClass: ApiTokenGuard,
    },
  ],
})
export class AppModule {}
