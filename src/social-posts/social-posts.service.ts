import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { RecordEngagementDto } from './dto/record-engagement.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { WriteDescriptionDto } from './dto/write-description.dto';

type SupportedPlatform = 'facebook' | 'instagram';
type MediaType = 'image' | 'video';

type SocialPostStatus =
  | 'awaiting_media'
  | 'awaiting_description'
  | 'awaiting_schedule'
  | 'scheduled'
  | 'published';

interface SocialPostSteps {
  mediaUploaded: boolean;
  descriptionWritten: boolean;
  scheduleConfirmed: boolean;
}

interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  impressions: number;
  reach: number;
  clicks: number;
}

interface SocialPost {
  id: string;
  platform: SupportedPlatform;
  goal?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  mediaAltText?: string;
  caption?: string;
  hashtags: string[];
  callToAction?: string;
  locationTag?: string;
  scheduledTime?: string;
  timezone?: string;
  publishedAt?: string;
  status: SocialPostStatus;
  createdAt: string;
  updatedAt: string;
  steps: SocialPostSteps;
  engagement: EngagementMetrics;
  optimisationNotes: string[];
}

interface FlowProgress {
  completedSteps: number;
  totalSteps: number;
  percentage: number;
  completed: string[];
}

interface FlowAction {
  action:
    | 'upload_media'
    | 'write_caption'
    | 'schedule_publication'
    | 'ready_to_publish'
    | 'monitor_engagement';
  instructions: string;
}

export interface FlowResponse {
  post: PublicSocialPost;
  nextAction: FlowAction;
  progress: FlowProgress;
  message: string;
}

export interface PublicSocialPost {
  id: string;
  platform: SupportedPlatform;
  goal?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  mediaAltText?: string;
  caption?: string;
  hashtags: string[];
  callToAction?: string;
  locationTag?: string;
  scheduledTime?: string;
  timezone?: string;
  publishedAt?: string;
  status: SocialPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementInsight {
  platform: SupportedPlatform;
  status: SocialPostStatus;
  metrics: EngagementMetrics;
  engagementRate: number;
  clickThroughRate: number;
  highlights: string[];
}

@Injectable()
export class SocialPostsService {
  private readonly posts = new Map<string, SocialPost>();

  createFlow(dto: CreateSocialPostDto): FlowResponse {
    if (!dto.platform) {
      throw new BadRequestException('A target platform is required to start a post.');
    }

    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const post: SocialPost = {
      id,
      platform: dto.platform,
      goal: dto.goal,
      status: 'awaiting_media',
      createdAt: timestamp,
      updatedAt: timestamp,
      steps: {
        mediaUploaded: false,
        descriptionWritten: false,
        scheduleConfirmed: false,
      },
      hashtags: [],
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
      },
      optimisationNotes: dto.brandVoice
        ? [`Use a ${dto.brandVoice} tone for the caption and call-to-action.`]
        : [],
    };

    if (dto.initialCaptionIdea) {
      post.optimisationNotes.push(
        'Incorporate the provided caption idea and optimise it for clarity and engagement.',
      );
    }

    this.posts.set(id, post);

    return this.buildFlowResponse(
      post,
      'Flow created. Upload a photo or video to keep things moving.',
    );
  }

  uploadMedia(id: string, dto: UploadMediaDto): FlowResponse {
    const post = this.getPostOrThrow(id);

    if (post.steps.mediaUploaded) {
      throw new BadRequestException('Media has already been uploaded for this post.');
    }

    if (!dto.mediaUrl || !dto.mediaType) {
      throw new BadRequestException('Both mediaUrl and mediaType are required.');
    }

    post.mediaUrl = dto.mediaUrl;
    post.mediaType = dto.mediaType;
    post.mediaAltText = dto.altText;
    post.steps.mediaUploaded = true;
    post.status = 'awaiting_description';
    post.updatedAt = new Date().toISOString();

    if (dto.altText) {
      post.optimisationNotes.push('Alt text added. Remember to keep accessibility in mind.');
    }

    return this.buildFlowResponse(
      post,
      'Media uploaded. Let’s craft an engaging caption and hashtags next.',
    );
  }

  writeDescription(id: string, dto: WriteDescriptionDto): FlowResponse {
    const post = this.getPostOrThrow(id);

    if (!post.steps.mediaUploaded) {
      throw new BadRequestException('Upload media before writing the description.');
    }

    post.caption = dto.caption;
    post.hashtags = dto.hashtags ?? [];
    post.callToAction = dto.callToAction;
    post.locationTag = dto.locationTag;
    post.steps.descriptionWritten = true;
    post.status = 'awaiting_schedule';
    post.updatedAt = new Date().toISOString();

    if (dto.hashtags?.length) {
      post.optimisationNotes.push(
        `Hashtags selected (${dto.hashtags.length}). Keep monitoring which ones resonate most.`,
      );
    }

    if (dto.caption?.length && dto.caption.length < 50) {
      post.optimisationNotes.push('Caption is concise. Consider adding a hook in the first sentence.');
    }

    return this.buildFlowResponse(
      post,
      'Copy looks great. Choose when you want this to go live.',
    );
  }

  schedulePost(id: string, dto: SchedulePostDto): FlowResponse {
    const post = this.getPostOrThrow(id);

    if (!post.steps.descriptionWritten) {
      throw new BadRequestException('Complete the caption before scheduling the post.');
    }

    const scheduledDate = new Date(dto.scheduledTime);
    if (Number.isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('scheduledTime must be a valid ISO 8601 date string.');
    }

    post.scheduledTime = scheduledDate.toISOString();
    post.timezone = dto.timezone ?? 'UTC';
    post.steps.scheduleConfirmed = true;
    post.status = 'scheduled';
    post.updatedAt = new Date().toISOString();

    if (scheduledDate.getTime() <= Date.now()) {
      post.optimisationNotes.push('Scheduled time is in the past. Consider publishing immediately.');
    }

    return this.buildFlowResponse(
      post,
      'Your post is scheduled. You can publish now or let it go out automatically.',
    );
  }

  publishNow(id: string): FlowResponse {
    const post = this.getPostOrThrow(id);

    if (!post.steps.mediaUploaded || !post.steps.descriptionWritten) {
      throw new BadRequestException('Complete the content preparation steps before publishing.');
    }

    post.status = 'published';
    post.publishedAt = new Date().toISOString();
    post.steps.scheduleConfirmed = true;
    post.updatedAt = post.publishedAt;

    return this.buildFlowResponse(post, 'Post published! Start tracking the engagement.');
  }

  recordEngagement(id: string, dto: RecordEngagementDto): EngagementInsight {
    const post = this.getPostOrThrow(id);

    post.engagement = {
      likes: dto.likes ?? post.engagement.likes,
      comments: dto.comments ?? post.engagement.comments,
      shares: dto.shares ?? post.engagement.shares,
      saves: dto.saves ?? post.engagement.saves,
      impressions: dto.impressions ?? post.engagement.impressions,
      reach: dto.reach ?? post.engagement.reach,
      clicks: dto.clicks ?? post.engagement.clicks,
    };
    post.updatedAt = new Date().toISOString();

    if ((dto.likes ?? 0) + (dto.comments ?? 0) > 50) {
      post.optimisationNotes.push('Strong community response detected. Repurpose this format soon.');
    }

    return this.getEngagementInsights(id);
  }

  getEngagementInsights(id: string): EngagementInsight {
    const post = this.getPostOrThrow(id);
    const { engagement } = post;

    const totalEngagement =
      engagement.likes + engagement.comments + engagement.shares + engagement.saves;

    const engagementRate = engagement.impressions
      ? Number(((totalEngagement / engagement.impressions) * 100).toFixed(2))
      : 0;

    const clickThroughRate = engagement.impressions
      ? Number(((engagement.clicks / engagement.impressions) * 100).toFixed(2))
      : 0;

    const highlights: string[] = [];
    if (engagementRate > 5) {
      highlights.push('Excellent engagement rate. Audience found this content compelling.');
    } else if (engagementRate > 0) {
      highlights.push('Engagement is building. Try testing different hooks or visuals next time.');
    } else {
      highlights.push('No engagement yet. Promote the post or encourage staff to interact.');
    }

    if (clickThroughRate > 2) {
      highlights.push('Strong call-to-action. Consider reusing similar messaging.');
    }

    if (post.optimisationNotes.length) {
      highlights.push(post.optimisationNotes.at(-1) as string);
    }

    return {
      platform: post.platform,
      status: post.status,
      metrics: { ...post.engagement },
      engagementRate,
      clickThroughRate,
      highlights,
    };
  }

  getPost(id: string): PublicSocialPost {
    const post = this.getPostOrThrow(id);
    return this.toPublicPost(post);
  }

  listPosts(): PublicSocialPost[] {
    return Array.from(this.posts.values()).map((post) => this.toPublicPost(post));
  }

  private getPostOrThrow(id: string): SocialPost {
    const post = this.posts.get(id);
    if (!post) {
      throw new NotFoundException(`No post found with id ${id}`);
    }
    return post;
  }

  private buildFlowResponse(post: SocialPost, message: string): FlowResponse {
    return {
      post: this.toPublicPost(post),
      nextAction: this.getNextAction(post),
      progress: this.getProgress(post),
      message,
    };
  }

  private getNextAction(post: SocialPost): FlowAction {
    if (!post.steps.mediaUploaded) {
      return {
        action: 'upload_media',
        instructions: 'Upload a high quality image or video to represent your post.',
      };
    }

    if (!post.steps.descriptionWritten) {
      return {
        action: 'write_caption',
        instructions: 'Craft a caption, hashtags, and CTA tailored to the platform.',
      };
    }

    if (!post.steps.scheduleConfirmed) {
      return {
        action: 'schedule_publication',
        instructions: 'Pick a date, time, and timezone for publishing.',
      };
    }

    if (post.status === 'scheduled') {
      return {
        action: 'ready_to_publish',
        instructions: 'Publish now or let the scheduler push it live automatically.',
      };
    }

    return {
      action: 'monitor_engagement',
      instructions: 'Keep an eye on likes, comments, and shares to learn what resonates.',
    };
  }

  private getProgress(post: SocialPost): FlowProgress {
    const steps: Array<keyof SocialPostSteps> = [
      'mediaUploaded',
      'descriptionWritten',
      'scheduleConfirmed',
    ];
    const completed = steps.filter((step) => post.steps[step]);
    const totalSteps = steps.length;
    const completedSteps = completed.length;
    const percentage = Number(((completedSteps / totalSteps) * 100).toFixed(0));

    const labels: Record<keyof SocialPostSteps, string> = {
      mediaUploaded: 'Media uploaded',
      descriptionWritten: 'Caption approved',
      scheduleConfirmed: 'Scheduled or published',
    };

    return {
      completedSteps,
      totalSteps,
      percentage,
      completed: completed.map((step) => labels[step]),
    };
  }

  private toPublicPost(post: SocialPost): PublicSocialPost {
    const {
      id,
      platform,
      goal,
      mediaType,
      mediaUrl,
      mediaAltText,
      caption,
      hashtags,
      callToAction,
      locationTag,
      scheduledTime,
      timezone,
      publishedAt,
      status,
      createdAt,
      updatedAt,
    } = post;

    return {
      id,
      platform,
      goal,
      mediaType,
      mediaUrl,
      mediaAltText,
      caption,
      hashtags,
      callToAction,
      locationTag,
      scheduledTime,
      timezone,
      publishedAt,
      status,
      createdAt,
      updatedAt,
    };
  }
}
