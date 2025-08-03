import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FacebookService {
  private accessToken = process.env.META_ACCESS_TOKEN;
  private adAccountId = process.env.META_AD_ACCOUNT_ID;
  private apiVersion = process.env.META_API_VERSION;

  private get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}`;
  }

  async getAdCampaigns() {
    const url = `${this.baseUrl}/${this.adAccountId}/campaigns`;
    const response = await axios.get(url, {
      params: {
        access_token: this.accessToken,
        fields: 'id,name,status',
      },
    });
    return response.data;
  }

  async createCampaign(name: string) {
    const url = `${this.baseUrl}/${this.adAccountId}/campaigns`;
    const response = await axios.post(
      url,
      {
        name,
        objective: 'LINK_CLICKS',
        status: 'PAUSED',
        special_ad_categories: [],
        access_token: this.accessToken,
      }
    );
    return response.data;
  }
}
