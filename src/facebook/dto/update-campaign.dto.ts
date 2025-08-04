/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCampaignDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  status?: string;
}
