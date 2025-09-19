/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
}

export enum BuyingType {
  AUCTION = 'AUCTION',
  RESERVED = 'RESERVED',
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ enum: CampaignStatus, default: CampaignStatus.PAUSED })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  objective?: string; // e.g., LINK_CLICKS, CONVERSIONS, etc.

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsArray()
  @IsOptional()
  special_ad_categories?: string[];

  @ApiPropertyOptional({ enum: BuyingType, default: BuyingType.AUCTION })
  @IsEnum(BuyingType)
  @IsOptional()
  buying_type?: BuyingType;
}
