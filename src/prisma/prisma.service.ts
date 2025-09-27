import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Declare dynamic model delegates so TypeScript compilation succeeds even when
  // the generated Prisma client typings are unavailable in the environment.
  declare businessAccount: any;
  declare businessMetaDetail: any;
  declare businessCompetitor: any;
  declare businessCredential: any;
  declare businessSocialReview: any;

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
