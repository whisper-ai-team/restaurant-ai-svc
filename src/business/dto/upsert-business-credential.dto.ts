import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpsertBusinessCredentialDto {
  @IsString()
  systemUserToken!: string;

  @IsOptional()
  @IsString()
  tokenType?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantedScopes?: string[];

  @IsOptional()
  connectedAssets?: unknown;

  @IsOptional()
  @IsString()
  metaBusinessId?: string;
}
