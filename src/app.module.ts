import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BrandController } from './brand/brand.controller';
import { BrandService } from './brand/brand.service';
import { BusinessModule } from './business/business.module';
import { CompetitorsController } from './competitors/competitors.controller';
import { CompetitorsService } from './competitors/competitors.service';
import { FacebookController } from './facebook/facebook.controller';
import { FacebookService } from './facebook/facebook.service';
import { PrismaModule } from './prisma/prisma.module';
import { SocialPostsController } from './social-posts/social-posts.controller';
import { SocialPostsService } from './social-posts/social-posts.service';
import { UserModule } from './user/user.module';
import { ClerkJwtGuard } from './security/clerk-jwt.guard';

@Module({
  imports: [PrismaModule, BusinessModule, UserModule],
  controllers: [
    FacebookController,
    SocialPostsController,
    BrandController,
    CompetitorsController,
  ],
  providers: [
    FacebookService,
    SocialPostsService,
    BrandService,
    CompetitorsService,
    {
      provide: APP_GUARD,
      useClass: ClerkJwtGuard,
    },
  ],
})
export class AppModule {}
