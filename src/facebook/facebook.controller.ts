/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FacebookService } from './facebook.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@ApiTags('facebook')
@ApiBearerAuth()
@Controller('facebook')
export class FacebookController {
  constructor(private readonly fb: FacebookService) {}

  @Get('health')
  @ApiOperation({ summary: 'Quick token + ad account sanity' })
  health() {
    return this.fb.health();
  }

  @Get('me/adaccounts')
  @ApiOperation({ summary: 'List ad accounts visible to this token' })
  meAdAccounts() {
    return this.fb.listMyAdAccounts();
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get campaigns with paging' })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiQuery({ name: 'after', required: false, description: 'paging cursor' })
  @ApiQuery({
    name: 'effective_status',
    required: false,
    example: 'ACTIVE,PAUSED',
    description: 'comma-separated list: ACTIVE, PAUSED, ARCHIVED, DELETED, ...',
  })
  getCampaigns(
    @Query('limit') limit?: string,
    @Query('after') after?: string,
    @Query('effective_status') effectiveStatusCSV?: string,
  ) {
    const effective_status = effectiveStatusCSV
      ? effectiveStatusCSV.split(',').map(s => s.trim())
      : undefined;
    return this.fb.getAdCampaigns({ limit: Number(limit) || 25, after, effective_status });
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  getCampaign(@Param('id') id: string) {
    return this.fb.getCampaign(id);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new campaign' })
  createCampaign(@Body() body: CreateCampaignDto) {
    return this.fb.createCampaign(body);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update a campaign' })
  updateCampaign(@Param('id') id: string, @Body() body: UpdateCampaignDto) {
    return this.fb.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete a campaign' })
  deleteCampaign(@Param('id') id: string) {
    return this.fb.deleteCampaign(id);
  }

  @Get('campaigns/:id/insights')
  @ApiOperation({ summary: 'Get campaign insights (last_7d)' })
  getCampaignInsights(@Param('id') id: string) {
    return this.fb.getCampaignInsights(id);
  }
}
