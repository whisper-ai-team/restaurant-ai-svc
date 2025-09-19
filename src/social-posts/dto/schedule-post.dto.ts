import { ApiProperty } from '@nestjs/swagger';

export class SchedulePostDto {
  @ApiProperty({ description: 'ISO 8601 date-time when the post should go live.' })
  scheduledTime: string;

  @ApiProperty({
    required: false,
    description: 'Timezone identifier for the scheduled date, defaults to UTC.',
    example: 'America/New_York',
  })
  timezone?: string;
}
