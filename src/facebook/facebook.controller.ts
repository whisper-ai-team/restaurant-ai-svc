/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FacebookService } from './facebook.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@ApiTags('facebook')
@ApiBearerAuth()
@Controller('facebook')
export class FacebookController {
  constructor(private readonly fbService: FacebookService) {}

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all ad campaigns' })
  @ApiResponse({ status: 200, description: 'List of campaigns' })
  getCampaigns() {
    return this.fbService.getAdCampaigns();
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  getCampaign(@Param('id') id: string) {
    return this.fbService.getCampaign(id);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  createCampaign(@Body() body: CreateCampaignDto) {
    return this.fbService.createCampaign(body);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated' })
  updateCampaign(@Param('id') id: string, @Body() body: UpdateCampaignDto) {
    return this.fbService.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  deleteCampaign(@Param('id') id: string) {
    return this.fbService.deleteCampaign(id);
  }

  @Get('campaigns/:id/insights')
  @ApiOperation({ summary: 'Get campaign insights' })
  @ApiResponse({ status: 200, description: 'Campaign insights' })
  getCampaignInsights(@Param('id') id: string) {
    return this.fbService.getCampaignInsights(id);
  }
}
