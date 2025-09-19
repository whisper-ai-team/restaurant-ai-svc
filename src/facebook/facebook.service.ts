import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

dotenv.config();

type FbPaging = { cursors?: { before?: string; after?: string } };
type FbList<T> = { data: T[]; paging?: FbPaging; summary?: { total_count?: number } };
type FbError = { error?: { message?: string; code?: number; type?: string; error_subcode?: number } };

type Campaign = {
  id: string;
  name: string;
  status: string;
  objective?: string;
  effective_status?: string;
  created_time?: string;
  updated_time?: string;
  buying_type?: string;
};

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly accessToken: string;
  private readonly appSecret?: string;
  private readonly adAccountId: string; // always act_ prefixed
  private readonly apiVersion: string;
  private readonly http: AxiosInstance;

  constructor() {
    this.accessToken  = this.requireEnv('META_ACCESS_TOKEN');
    this.apiVersion   = this.requireEnv('META_API_VERSION');
    this.appSecret    = process.env.META_APP_SECRET || undefined;

    const rawAdAccountId = this.requireEnv('META_AD_ACCOUNT_ID');
    this.adAccountId = rawAdAccountId.startsWith('act_') ? rawAdAccountId : `act_${rawAdAccountId}`;

    this.http = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      timeout: 20_000,
    });
  }

  private requireEnv(name: 'META_ACCESS_TOKEN' | 'META_API_VERSION' | 'META_AD_ACCOUNT_ID') {
    const v = process.env[name];
    if (!v) {
      const msg = `${name} environment variable is required for FacebookService.`;
      this.logger.error(msg);
      throw new Error(msg);
    }
    return v;
  }

  private appsecret_proof(token: string) {
    return this.appSecret
      ? crypto.createHmac('sha256', this.appSecret).update(token).digest('hex')
      : undefined;
  }

  private params(extra: Record<string, any> = {}) {
    const base: Record<string, any> = { access_token: this.accessToken };
    const proof = this.appsecret_proof(this.accessToken);
    if (proof) base.appsecret_proof = proof;
    return { ...base, ...extra };
  }

  private handleAxiosError(op: string, err: AxiosError<FbError>) {
    const status = err.response?.status ?? 500;
    const e = err.response?.data?.error;
    const msg = e?.message || err.message || 'Unknown Facebook API error';
    this.logger.error(`${op} failed: ${msg}`);
    throw new HttpException(msg, status);
  }

  // ---- Diagnostics / health ----
  async health() {
    try {
      const [perms, accounts] = await Promise.all([
        this.http.get('/me/permissions', { params: this.params() }).then(r => r.data),
        this.http.get('/me/adaccounts', {
          params: this.params({ fields: 'id,account_id,name,permissions' }),
        }).then(r => r.data),
      ]);
      const seesAccount = JSON.stringify(accounts).includes(this.adAccountId.replace('act_', ''));
      return {
        ok: true,
        seesConfiguredAdAccount: seesAccount,
        configuredAdAccountId: this.adAccountId,
        permissions: perms?.data ?? [],
        adaccounts_count: accounts?.data?.length ?? 0,
      };
    } catch (e) {
      this.handleAxiosError('health', e as AxiosError<FbError>);
    }
  }

  async listMyAdAccounts() {
    try {
      const res = await this.http.get<FbList<any>>('/me/adaccounts', {
        params: this.params({ fields: 'id,account_id,name,permissions,owner' }),
      });
      return res.data;
    } catch (e) {
      this.handleAxiosError('listMyAdAccounts', e as AxiosError<FbError>);
    }
  }

  // ---- Campaigns ----
  async getAdCampaigns(opts?: { limit?: number; after?: string; effective_status?: string[] }) {
    const { limit = 25, after, effective_status } = opts || {};
    const fields = [
      'id','name','status','objective','effective_status',
      'created_time','updated_time','buying_type'
    ].join(',');

    try {
      const res = await this.http.get<FbList<Campaign>>(`/${this.adAccountId}/campaigns`, {
        params: this.params({
          fields,
          limit,
          after,
          summary: 'total_count',
          ...(effective_status ? { effective_status } : {}),
        }),
      });

      const count = res.data?.data?.length ?? 0;
      if (count === 0) {
        return {
          message: 'No campaigns found for this account (try creating one in Ads Manager).',
          total: res.data?.summary?.total_count ?? 0,
          paging: res.data?.paging ?? null,
          data: [],
        };
      }

      return {
        total: res.data?.summary?.total_count ?? count,
        count,
        paging: res.data?.paging ?? null,
        data: res.data.data,
      };
    } catch (e) {
      this.handleAxiosError('getAdCampaigns', e as AxiosError<FbError>);
    }
  }

  async getCampaign(id: string) {
    try {
      const res = await this.http.get<Campaign>(`/${id}`, {
        params: this.params({
          fields: 'id,name,status,objective,effective_status,created_time,updated_time',
        }),
      });
      return res.data;
    } catch (e) {
      this.handleAxiosError('getCampaign', e as AxiosError<FbError>);
    }
  }

  async createCampaign(data: {
    name: string;
    objective?: string;
    status?: 'PAUSED' | 'ACTIVE';
    special_ad_categories?: string[];
    buying_type?: 'AUCTION' | 'RESERVED';
  }) {
    // Graph prefers form-encoded; axios will send JSON fine, but form is safest.
    const payload = new URLSearchParams({
      name: data.name,
      objective: data.objective ?? 'LINK_CLICKS',
      status: data.status ?? 'PAUSED',
      buying_type: data.buying_type ?? 'AUCTION',
      special_ad_categories: JSON.stringify(data.special_ad_categories ?? []),
      access_token: this.accessToken,
    });

    try {
      const res = await this.http.post<{ id: string }>(`/${this.adAccountId}/campaigns`, payload);
      return { id: res.data.id, message: 'Campaign created' };
    } catch (e) {
      this.handleAxiosError('createCampaign', e as AxiosError<FbError>);
    }
  }

  async updateCampaign(id: string, data: UpdateCampaignDto) {
    const payload = new URLSearchParams({ access_token: this.accessToken });
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) payload.append(k, String(v));
    });

    try {
      const res = await this.http.post<{ success: boolean }>(`/${id}`, payload);
      return { id, ...res.data };
    } catch (e) {
      this.handleAxiosError('updateCampaign', e as AxiosError<FbError>);
    }
  }

  async deleteCampaign(id: string) {
    try {
      const res = await this.http.delete<{ success: boolean }>(`/${id}`, {
        params: this.params(),
      });
      return { id, ...res.data };
    } catch (e) {
      this.handleAxiosError('deleteCampaign', e as AxiosError<FbError>);
    }
  }

  async getCampaignInsights(id: string) {
    try {
      const res = await this.http.get<FbList<any>>(`/${id}/insights`, {
        params: this.params({
          date_preset: 'last_7d',
          time_increment: 1,
          fields: [
            'date_start','date_stop',
            'impressions','reach','clicks','cpc','ctr',
            'spend','unique_clicks','actions','purchase_roas'
          ].join(','),
          limit: 50,
          summary: 'total_count',
        }),
      });

      const count = res.data?.data?.length ?? 0;
      return {
        count,
        total: res.data?.summary?.total_count ?? count,
        data: res.data?.data ?? [],
        paging: res.data?.paging ?? null,
      };
    } catch (e) {
      this.handleAxiosError('getCampaignInsights', e as AxiosError<FbError>);
    }
  }
}
