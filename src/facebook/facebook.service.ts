import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

dotenv.config();

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly accessToken = process.env.META_ACCESS_TOKEN;
  private readonly adAccountId = process.env.META_AD_ACCOUNT_ID;
  private readonly apiVersion = process.env.META_API_VERSION;

  private get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}`;
  }

  private handleError(operation: string, error: AxiosError) {
    const data = error.response?.data as
      | { error?: { message?: string } }
      | undefined;
    const message = data?.error?.message || error.message;
    const status = error.response?.status || 500;
    this.logger.error(`${operation} failed: ${message}`);
    throw new HttpException(message, status);
  }

  async getAdCampaigns() {
    const url = `${this.baseUrl}/${this.adAccountId}/campaigns`;
    this.logger.log(`Fetching campaigns from ${url}`);
    try {
      const response: AxiosResponse<unknown> = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,status',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError('getAdCampaigns', error as AxiosError);
    }
  }

  async getCampaign(id: string) {
    const url = `${this.baseUrl}/${id}`;
    this.logger.log(`Fetching campaign ${id}`);
    try {
      const response: AxiosResponse<unknown> = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,status',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError('getCampaign', error as AxiosError);
    }
  }

  async createCampaign(data: {
    name: string;
    objective?: string;
    status?: string;
    special_ad_categories?: string[];
  }) {
    const url = `${this.baseUrl}/${this.adAccountId}/campaigns`;
    this.logger.log(`Creating campaign with name ${data.name}`);
    try {
      const response: AxiosResponse<unknown> = await axios.post(url, {
        access_token: this.accessToken,
        objective: 'LINK_CLICKS',
        status: 'PAUSED',
        special_ad_categories: [],
        ...data,
      });
      return response.data;
    } catch (error) {
      this.handleError('createCampaign', error as AxiosError);
    }
  }

  async updateCampaign(id: string, data: UpdateCampaignDto) {
    const url = `${this.baseUrl}/${id}`;
    this.logger.log(`Updating campaign ${id}`);
    try {
      const response: AxiosResponse<unknown> = await axios.post(url, {
        ...data,
        access_token: this.accessToken,
      });
      return response.data;
    } catch (error) {
      this.handleError('updateCampaign', error as AxiosError);
    }
  }

  async deleteCampaign(id: string) {
    const url = `${this.baseUrl}/${id}`;
    this.logger.log(`Deleting campaign ${id}`);
    try {
      const response: AxiosResponse<unknown> = await axios.delete(url, {
        params: { access_token: this.accessToken },
      });
      return response.data;
    } catch (error) {
      this.handleError('deleteCampaign', error as AxiosError);
    }
  }

  async getCampaignInsights(id: string) {
    const url = `${this.baseUrl}/${id}/insights`;
    this.logger.log(`Fetching insights for campaign ${id}`);
    try {
      const response: AxiosResponse<unknown> = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          date_preset: 'last_7d',
          fields: 'impressions,clicks,spend',
        },
      });
      return response.data;
    } catch (error) {
      this.handleError('getCampaignInsights', error as AxiosError);
    }
  }
}
