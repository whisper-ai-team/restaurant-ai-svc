import { ApiProperty } from '@nestjs/swagger';

type SupportedPlatform = 'facebook' | 'instagram';

export class CreateSocialPostDto {
  @ApiProperty({ enum: ['facebook', 'instagram'] })
  platform: SupportedPlatform;

  @ApiProperty({ required: false, description: 'High-level goal for the post (e.g. awareness).' })
  goal?: string;

  @ApiProperty({
    required: false,
    description: 'Voice and tone guidance for the generated captions.',
    example: 'playful',
  })
  brandVoice?: string;

  @ApiProperty({
    required: false,
    description: 'Optional caption idea to seed the assistant-generated copy.',
  })
  initialCaptionIdea?: string;
}
