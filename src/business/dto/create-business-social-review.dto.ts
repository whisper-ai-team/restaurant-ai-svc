import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewSentiment, SocialPlatform } from '../business.enums';

export class CreateBusinessSocialReviewDto {
  @IsEnum(SocialPlatform)
  platform!: SocialPlatform;

  @IsOptional()
  @IsString()
  reviewId?: string;

  @IsOptional()
  @IsString()
  reviewerName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  permalink?: string;

  @IsOptional()
  @IsDateString()
  postedAt?: string;

  @IsOptional()
  @IsEnum(ReviewSentiment)
  sentiment?: ReviewSentiment;

  @IsOptional()
  metadata?: unknown;
}
