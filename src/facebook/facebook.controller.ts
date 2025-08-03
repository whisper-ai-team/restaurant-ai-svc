import { Controller, Get, Post, Body } from '@nestjs/common';
import { FacebookService } from './facebook.service';

@Controller('facebook')
export class FacebookController {
  constructor(private readonly fbService: FacebookService) {}

  @Get('campaigns')
  getCampaigns() {
    return this.fbService.getAdCampaigns();
  }

  @Post('campaigns')
  createCampaign(@Body('name') name: string) {
    return this.fbService.createCampaign(name);
  }
}
