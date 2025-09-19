import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';

describe('SocialPostsService', () => {
  let service: SocialPostsService;

  beforeEach(() => {
    service = new SocialPostsService();
  });

  it('creates a flow and returns the first action', () => {
    const response = service.createFlow({ platform: 'facebook' });

    expect(response.post.id).toBeDefined();
    expect(response.post.platform).toBe('facebook');
    expect(response.nextAction.action).toBe('upload_media');
    expect(response.progress).toEqual(
      expect.objectContaining({ completedSteps: 0, totalSteps: 3, percentage: 0 }),
    );
  });

  it('walks through the end-to-end posting flow', () => {
    const creation = service.createFlow({ platform: 'instagram', goal: 'promote brunch' });

    const withMedia = service.uploadMedia(creation.post.id, {
      mediaType: 'image',
      mediaUrl: 'https://cdn.example.com/brunch.jpg',
      altText: 'Delicious brunch spread',
    });
    expect(withMedia.nextAction.action).toBe('write_caption');

    const withCaption = service.writeDescription(creation.post.id, {
      caption: 'Join us for weekend brunch!',
      hashtags: ['#brunch', '#foodie'],
      callToAction: 'Reserve your table now',
    });
    expect(withCaption.nextAction.action).toBe('schedule_publication');

    const scheduled = service.schedulePost(creation.post.id, {
      scheduledTime: new Date(Date.now() + 3_600_000).toISOString(),
      timezone: 'America/New_York',
    });
    expect(scheduled.post.status).toBe('scheduled');
    expect(scheduled.nextAction.action).toBe('ready_to_publish');

    const published = service.publishNow(creation.post.id);
    expect(published.post.status).toBe('published');
    expect(published.nextAction.action).toBe('monitor_engagement');
    expect(published.progress.percentage).toBe(100);
  });

  it('prevents skipping required steps', () => {
    const creation = service.createFlow({ platform: 'facebook' });

    expect(() =>
      service.writeDescription(creation.post.id, {
        caption: 'Caption before media upload',
      }),
    ).toThrow(BadRequestException);

    service.uploadMedia(creation.post.id, {
      mediaType: 'video',
      mediaUrl: 'https://cdn.example.com/teaser.mp4',
    });

    expect(() =>
      service.schedulePost(creation.post.id, {
        scheduledTime: new Date().toISOString(),
      }),
    ).toThrow(BadRequestException);
  });

  it('records and reports engagement insights', () => {
    const creation = service.createFlow({ platform: 'instagram' });
    service.uploadMedia(creation.post.id, {
      mediaType: 'image',
      mediaUrl: 'https://cdn.example.com/post.jpg',
    });
    service.writeDescription(creation.post.id, {
      caption: 'Tasty treats await',
    });
    service.publishNow(creation.post.id);

    const insight = service.recordEngagement(creation.post.id, {
      likes: 120,
      comments: 12,
      shares: 15,
      saves: 5,
      impressions: 2000,
      reach: 1500,
      clicks: 90,
    });

    expect(insight.metrics.likes).toBe(120);
    expect(insight.engagementRate).toBeGreaterThan(0);
    expect(insight.highlights.length).toBeGreaterThan(0);

    const retrieved = service.getEngagementInsights(creation.post.id);
    expect(retrieved.metrics.comments).toBe(12);
  });

  it('throws when requesting an unknown post', () => {
    expect(() => service.getPost('missing')).toThrow(NotFoundException);
  });
});
