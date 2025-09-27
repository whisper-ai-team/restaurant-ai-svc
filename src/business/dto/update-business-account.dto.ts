import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { BusinessAccountStatus } from '../business.enums';

export class UpdateBusinessAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  metaBusinessId?: string;

  @IsOptional()
  @IsString()
  configurationId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectUri?: string;

  @IsOptional()
  @IsEnum(BusinessAccountStatus)
  status?: BusinessAccountStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
