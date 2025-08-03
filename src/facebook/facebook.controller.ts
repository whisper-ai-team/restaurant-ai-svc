import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly fbService: FacebookService) {}

  @Get('campaigns')
  getCampaigns() {
    return this.fbService.getAdCampaigns();
  }

  @Get('campaigns/:id')
  getCampaign(@Param('id') id: string) {
    return this.fbService.getCampaign(id);
  }

  @Post('campaigns')
  createCampaign(@Body() body: CreateCampaignDto) {
    return this.fbService.createCampaign(body);
  }

  @Patch('campaigns/:id')
  updateCampaign(@Param('id') id: string, @Body() body: UpdateCampaignDto) {
    return this.fbService.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Param('id') id: string) {
    return this.fbService.deleteCampaign(id);
  }

  @Get('campaigns/:id/insights')
  getCampaignInsights(@Param('id') id: string) {
    return this.fbService.getCampaignInsights(id);
  }
}
