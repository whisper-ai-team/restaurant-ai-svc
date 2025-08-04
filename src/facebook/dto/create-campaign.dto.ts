/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  objective?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false, type: [String] })
  special_ad_categories?: string[];
}
