import { ApiProperty } from '@nestjs/swagger';

export class WriteDescriptionDto {
  @ApiProperty({ description: 'Caption that will appear under the media.' })
  caption: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Hashtags to amplify reach and discoverability.',
  })
  hashtags?: string[];

  @ApiProperty({
    required: false,
    description: 'Optional call-to-action that encourages user engagement.',
  })
  callToAction?: string;

  @ApiProperty({ required: false, description: 'Location tag associated with the post.' })
  locationTag?: string;
}
