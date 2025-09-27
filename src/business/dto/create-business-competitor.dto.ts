import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBusinessCompetitorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  facebookPageId?: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  website?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  addedBy?: string;
}
