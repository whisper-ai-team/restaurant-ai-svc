import { ApiProperty } from '@nestjs/swagger';

type MediaType = 'image' | 'video';

export class UploadMediaDto {
  @ApiProperty({ enum: ['image', 'video'] })
  mediaType: MediaType;

  @ApiProperty({ description: 'Location of the uploaded asset that will be posted.' })
  mediaUrl: string;

  @ApiProperty({
    required: false,
    description: 'Alt text used to describe the media for accessibility.',
  })
  altText?: string;
}
