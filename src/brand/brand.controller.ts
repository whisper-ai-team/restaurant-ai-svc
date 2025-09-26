import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';

@ApiTags('brand')
@ApiBearerAuth()
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get(':domain')
  @ApiOperation({ summary: 'Retrieve brand information from Brandfetch' })
  @ApiParam({ name: 'domain', example: 'openai.com' })
  getBrand(@Param('domain') domain: string) {
    return this.brandService.getBrandInfo(domain);
  }
}
