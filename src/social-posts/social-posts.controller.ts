import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { RecordEngagementDto } from './dto/record-engagement.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { WriteDescriptionDto } from './dto/write-description.dto';
import { SocialPostsService } from './social-posts.service';
import type { FlowResponse } from './social-posts.service';

@ApiTags('social-posts')
@Controller('social-posts')
export class SocialPostsController {
  constructor(private readonly socialPostsService: SocialPostsService) {}

  @Post()
  startFlow(@Body() dto: CreateSocialPostDto): FlowResponse {
    return this.socialPostsService.createFlow(dto);
  }

  @Get()
  list() {
    return this.socialPostsService.listPosts();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.socialPostsService.getPost(id);
  }

  @Post(':id/media')
  uploadMedia(@Param('id') id: string, @Body() dto: UploadMediaDto): FlowResponse {
    return this.socialPostsService.uploadMedia(id, dto);
  }

  @Post(':id/description')
  writeDescription(
    @Param('id') id: string,
    @Body() dto: WriteDescriptionDto,
  ): FlowResponse {
    return this.socialPostsService.writeDescription(id, dto);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body() dto: SchedulePostDto): FlowResponse {
    return this.socialPostsService.schedulePost(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string): FlowResponse {
    return this.socialPostsService.publishNow(id);
  }

  @Post(':id/engagement')
  recordEngagement(
    @Param('id') id: string,
    @Body() dto: RecordEngagementDto,
  ) {
    return this.socialPostsService.recordEngagement(id, dto);
  }

  @Get(':id/engagement')
  getEngagement(@Param('id') id: string) {
    return this.socialPostsService.getEngagementInsights(id);
  }
}
