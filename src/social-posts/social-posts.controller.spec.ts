import { Test, TestingModule } from '@nestjs/testing';
import { SocialPostsController } from './social-posts.controller';
import { SocialPostsService } from './social-posts.service';

describe('SocialPostsController', () => {
  let controller: SocialPostsController;
  let service: SocialPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialPostsController],
      providers: [SocialPostsService],
    }).compile();

    controller = module.get<SocialPostsController>(SocialPostsController);
    service = module.get<SocialPostsService>(SocialPostsService);
  });

  it('starts a new flow', () => {
    const spy = jest.spyOn(service, 'createFlow');
    controller.startFlow({ platform: 'facebook' });
    expect(spy).toHaveBeenCalledWith({ platform: 'facebook' });
  });

  it('proxies scheduling to the service', () => {
    const post = service.createFlow({ platform: 'instagram' }).post;
    service.uploadMedia(post.id, { mediaType: 'image', mediaUrl: 'https://cdn.example.com' });
    service.writeDescription(post.id, { caption: 'Caption ready to go' });
    const spy = jest.spyOn(service, 'schedulePost');

    controller.schedule(post.id, {
      scheduledTime: new Date().toISOString(),
    });

    expect(spy).toHaveBeenCalledWith(post.id, expect.any(Object));
  });

  it('returns engagement insights', () => {
    const created = service.createFlow({ platform: 'facebook' });
    service.uploadMedia(created.post.id, { mediaType: 'image', mediaUrl: 'https://cdn.example.com' });
    service.writeDescription(created.post.id, { caption: 'A great meal awaits' });
    service.publishNow(created.post.id);

    const spy = jest.spyOn(service, 'getEngagementInsights');
    controller.getEngagement(created.post.id);
    expect(spy).toHaveBeenCalledWith(created.post.id);
  });
});
