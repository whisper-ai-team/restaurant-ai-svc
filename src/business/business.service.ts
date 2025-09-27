import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessAccountStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessAccountDto } from './dto/create-business-account.dto';
import { UpdateBusinessAccountDto } from './dto/update-business-account.dto';
import { UpsertBusinessMetaDetailDto } from './dto/upsert-business-meta-detail.dto';
import { CreateBusinessCompetitorDto } from './dto/create-business-competitor.dto';
import { UpdateBusinessCompetitorDto } from './dto/update-business-competitor.dto';
import { UpsertBusinessCredentialDto } from './dto/upsert-business-credential.dto';
import { CreateBusinessSocialReviewDto } from './dto/create-business-social-review.dto';
import { UpdateBusinessSocialReviewDto } from './dto/update-business-social-review.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly accountInclude = {
    metaDetails: true,
    credentials: true,
    competitors: true,
    socialReviews: true,
  } as const;

  async createAccount(dto: CreateBusinessAccountDto) {
    return this.prisma.businessAccount.create({ data: dto, include: this.accountInclude });
  }

  async findAllAccounts() {
    return this.prisma.businessAccount.findMany({ include: this.accountInclude });
  }

  async findOneAccount(id: string) {
    const account = await this.prisma.businessAccount.findUnique({ where: { id }, include: this.accountInclude });
    if (!account) {
      throw new NotFoundException(`Business account ${id} not found`);
    }
    return account;
  }

  async updateAccount(id: string, dto: UpdateBusinessAccountDto) {
    await this.ensureAccount(id);
    return this.prisma.businessAccount.update({ where: { id }, data: dto, include: this.accountInclude });
  }

  async removeAccount(id: string) {
    await this.ensureAccount(id);
    await this.prisma.businessAccount.delete({ where: { id } });
    return { id };
  }

  async upsertMetaDetails(businessAccountId: string, dto: UpsertBusinessMetaDetailDto) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessMetaDetail.upsert({
      where: { businessAccountId },
      update: dto,
      create: { businessAccountId, ...dto },
    });
  }

  async getMetaDetails(businessAccountId: string) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessMetaDetail.findUnique({ where: { businessAccountId } });
  }

  async listCompetitors(businessAccountId: string) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessCompetitor.findMany({ where: { businessAccountId } });
  }

  async addCompetitor(businessAccountId: string, dto: CreateBusinessCompetitorDto) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessCompetitor.create({ data: { ...dto, businessAccountId } });
  }

  async updateCompetitor(
    businessAccountId: string,
    competitorId: string,
    dto: UpdateBusinessCompetitorDto,
  ) {
    await this.ensureCompetitor(businessAccountId, competitorId);
    return this.prisma.businessCompetitor.update({ where: { id: competitorId }, data: dto });
  }

  async removeCompetitor(businessAccountId: string, competitorId: string) {
    await this.ensureCompetitor(businessAccountId, competitorId);
    await this.prisma.businessCompetitor.delete({ where: { id: competitorId } });
    return { id: competitorId };
  }

  async getCredential(businessAccountId: string) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessCredential.findUnique({ where: { businessAccountId } });
  }

  async upsertCredential(businessAccountId: string, dto: UpsertBusinessCredentialDto) {
    await this.ensureAccount(businessAccountId);

    const { expiresAt, connectedAssets, grantedScopes, systemUserToken, tokenType, metaBusinessId } = dto;

    const expiresAtValue =
      typeof expiresAt !== 'undefined' ? (expiresAt ? new Date(expiresAt) : null) : undefined;
    const connectedAssetsValue = this.normalizeJson(connectedAssets);

    const createData: Prisma.BusinessCredentialUncheckedCreateInput = {
      businessAccountId,
      systemUserToken,
      tokenType: tokenType ?? 'SYSTEM_USER',
      grantedScopes: grantedScopes ?? [],
    };

    if (expiresAtValue !== undefined) {
      createData.expiresAt = expiresAtValue;
    }

    if (connectedAssetsValue !== undefined) {
      createData.connectedAssets = connectedAssetsValue;
    }

    if (typeof metaBusinessId !== 'undefined') {
      createData.metaBusinessId = metaBusinessId;
    }

    const updateData: Prisma.BusinessCredentialUncheckedUpdateInput = {
      systemUserToken,
    };

    if (typeof tokenType !== 'undefined') {
      updateData.tokenType = tokenType;
    }

    if (expiresAtValue !== undefined) {
      updateData.expiresAt = expiresAtValue;
    }

    if (typeof grantedScopes !== 'undefined') {
      updateData.grantedScopes = grantedScopes;
    }

    if (connectedAssetsValue !== undefined) {
      updateData.connectedAssets = connectedAssetsValue;
    }

    if (typeof metaBusinessId !== 'undefined') {
      updateData.metaBusinessId = metaBusinessId;
    }

    const [credential] = await this.prisma.$transaction([
      this.prisma.businessCredential.upsert({
        where: { businessAccountId },
        update: updateData,
        create: createData,
      }),
      this.prisma.businessAccount.update({
        where: { id: businessAccountId },
        data: { status: BusinessAccountStatus.CONNECTED },
      }),
    ]);

    return credential;
  }

  async listSocialReviews(businessAccountId: string) {
    await this.ensureAccount(businessAccountId);
    return this.prisma.businessSocialReview.findMany({ where: { businessAccountId } });
  }

  async addSocialReview(businessAccountId: string, dto: CreateBusinessSocialReviewDto) {
    await this.ensureAccount(businessAccountId);
    const { postedAt, metadata, ...rest } = dto;
    const postedAtValue =
      typeof postedAt !== 'undefined' ? (postedAt ? new Date(postedAt) : null) : undefined;
    const metadataValue = this.normalizeJson(metadata);
    return this.prisma.businessSocialReview.create({
      data: {
        ...rest,
        businessAccountId,
        ...(postedAtValue !== undefined ? { postedAt: postedAtValue } : {}),
        ...(metadataValue !== undefined ? { metadata: metadataValue } : {}),
      },
    });
  }

  async updateSocialReview(
    businessAccountId: string,
    reviewId: string,
    dto: UpdateBusinessSocialReviewDto,
  ) {
    await this.ensureSocialReview(businessAccountId, reviewId);
    const { postedAt, metadata, ...rest } = dto;
    const postedAtValue =
      typeof postedAt !== 'undefined' ? (postedAt ? new Date(postedAt) : null) : undefined;
    const metadataValue = this.normalizeJson(metadata);
    return this.prisma.businessSocialReview.update({
      where: { id: reviewId },
      data: {
        ...rest,
        ...(postedAtValue !== undefined ? { postedAt: postedAtValue } : {}),
        ...(metadataValue !== undefined ? { metadata: metadataValue } : {}),
      },
    });
  }

  async removeSocialReview(businessAccountId: string, reviewId: string) {
    await this.ensureSocialReview(businessAccountId, reviewId);
    await this.prisma.businessSocialReview.delete({ where: { id: reviewId } });
    return { id: reviewId };
  }

  private async ensureAccount(id: string) {
    const exists = await this.prisma.businessAccount.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Business account ${id} not found`);
    }
  }

  private async ensureCompetitor(businessAccountId: string, competitorId: string) {
    const competitor = await this.prisma.businessCompetitor.findFirst({
      where: { id: competitorId, businessAccountId },
      select: { id: true },
    });
    if (!competitor) {
      throw new NotFoundException(
        `Business competitor ${competitorId} not found for account ${businessAccountId}`,
      );
    }
  }

  private async ensureSocialReview(businessAccountId: string, reviewId: string) {
    const review = await this.prisma.businessSocialReview.findFirst({
      where: { id: reviewId, businessAccountId },
      select: { id: true },
    });
    if (!review) {
      throw new NotFoundException(
        `Social review ${reviewId} not found for account ${businessAccountId}`,
      );
    }
  }

  private normalizeJson(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (typeof value === 'undefined') {
      return undefined;
    }
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value as Prisma.InputJsonValue;
  }
}
