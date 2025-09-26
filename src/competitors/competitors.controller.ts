import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompetitorsService } from './competitors.service';

@ApiTags('competitors')
@ApiBearerAuth()
@Controller('competitors')
export class CompetitorsController {
  constructor(private readonly competitorsService: CompetitorsService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby competitors using Google Places' })
  @ApiQuery({
    name: 'input',
    description: 'Text query describing the business to locate',
    example: 'Bawarchi Biryanis Atlanta',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'Search radius in meters (defaults to 2000)',
    example: 2000,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Place type filter for competitors',
    example: 'restaurant',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Additional keyword to match competitors',
    example: 'Indian',
  })
  findNearby(
    @Query('input') input?: string,
    @Query('radius') radius?: string,
    @Query('type') type?: string,
    @Query('keyword') keyword?: string,
  ) {
    if (!input) {
      throw new BadRequestException('Query parameter "input" is required');
    }

    const radiusNumber = radius ? Number(radius) : undefined;
    if (radius && Number.isNaN(radiusNumber)) {
      throw new BadRequestException('Query parameter "radius" must be a number');
    }

    return this.competitorsService.findNearbyCompetitors({
      input,
      radius: radiusNumber,
      type: type || 'restaurant',
      keyword,
    });
  }
}
