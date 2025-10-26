import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessAccountDto } from './dto/create-business-account.dto';
import { UpdateBusinessAccountDto } from './dto/update-business-account.dto';
import { UpsertBusinessMetaDetailDto } from './dto/upsert-business-meta-detail.dto';
import { CreateBusinessCompetitorDto } from './dto/create-business-competitor.dto';
import { UpdateBusinessCompetitorDto } from './dto/update-business-competitor.dto';
import { UpsertBusinessCredentialDto } from './dto/upsert-business-credential.dto';
import { CreateBusinessSocialReviewDto } from './dto/create-business-social-review.dto';
import { UpdateBusinessSocialReviewDto } from './dto/update-business-social-review.dto';

@ApiTags('business-accounts')
@Controller('business-accounts')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Body() dto: CreateBusinessAccountDto) {
    return this.businessService.createAccount(dto);
  }

  @Get()
  findAll() {
    return this.businessService.findAllAccounts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOneAccount(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessAccountDto) {
    return this.businessService.updateAccount(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.removeAccount(id);
  }

  @Put(':id/meta')
  upsertMeta(@Param('id') id: string, @Body() dto: UpsertBusinessMetaDetailDto) {
    return this.businessService.upsertMetaDetails(id, dto);
  }

  @Get(':id/meta')
  getMeta(@Param('id') id: string) {
    return this.businessService.getMetaDetails(id);
  }

  @Get(':id/competitors')
  listCompetitors(@Param('id') id: string) {
    return this.businessService.listCompetitors(id);
  }

  @Post(':id/competitors')
  addCompetitor(@Param('id') id: string, @Body() dto: CreateBusinessCompetitorDto) {
    return this.businessService.addCompetitor(id, dto);
  }

  @Patch(':id/competitors/:competitorId')
  updateCompetitor(
    @Param('id') id: string,
    @Param('competitorId') competitorId: string,
    @Body() dto: UpdateBusinessCompetitorDto,
  ) {
    return this.businessService.updateCompetitor(id, competitorId, dto);
  }

  @Delete(':id/competitors/:competitorId')
  removeCompetitor(@Param('id') id: string, @Param('competitorId') competitorId: string) {
    return this.businessService.removeCompetitor(id, competitorId);
  }

  @Get(':id/credentials')
  getCredential(@Param('id') id: string) {
    return this.businessService.getCredential(id);
  }

  @Put(':id/credentials')
  upsertCredential(@Param('id') id: string, @Body() dto: UpsertBusinessCredentialDto) {
    return this.businessService.upsertCredential(id, dto);
  }

  @Get(':id/social-reviews')
  listSocialReviews(@Param('id') id: string) {
    return this.businessService.listSocialReviews(id);
  }

  @Post(':id/social-reviews')
  addSocialReview(@Param('id') id: string, @Body() dto: CreateBusinessSocialReviewDto) {
    return this.businessService.addSocialReview(id, dto);
  }

  @Patch(':id/social-reviews/:reviewId')
  updateSocialReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateBusinessSocialReviewDto,
  ) {
    return this.businessService.updateSocialReview(id, reviewId, dto);
  }

  @Delete(':id/social-reviews/:reviewId')
  removeSocialReview(@Param('id') id: string, @Param('reviewId') reviewId: string) {
    return this.businessService.removeSocialReview(id, reviewId);
  }
}
