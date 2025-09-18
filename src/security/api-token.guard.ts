import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  private readonly securityEnabled =
    process.env.API_SECURITY_ENABLED === 'true';
  private readonly expectedToken = process.env.API_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    if (!this.securityEnabled) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    if (!token || token !== this.expectedToken) {
      throw new UnauthorizedException('Invalid or missing API token');
    }
    return true;
  }
}
