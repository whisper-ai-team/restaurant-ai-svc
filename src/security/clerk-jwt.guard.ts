import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Request } from 'express';
import { createPublicKey, verify, type JsonWebKey } from 'node:crypto';

interface JwksResponse {
  keys: JsonWebKeyWithKid[];
}

interface JsonWebKeyWithKid extends JsonWebKey {
  kid: string;
}

interface CachedKey {
  key: JsonWebKeyWithKid;
  expiresAt: number;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ClerkJwtGuard implements CanActivate {
  private readonly securityEnabled: boolean;
  private readonly issuer?: string;
  private readonly audience?: string;
  private readonly jwksUrl?: string;
  private readonly cacheTtlMs: number;
  private readonly httpClient: AxiosInstance;
  private readonly jwksCache = new Map<string, CachedKey>();

  constructor() {
    const enabledFlag =
      process.env.CLERK_JWT_AUTH_ENABLED ?? process.env.API_SECURITY_ENABLED;
    this.securityEnabled = enabledFlag === 'true';
    this.issuer = process.env.CLERK_ISSUER;
    this.audience = process.env.CLERK_AUDIENCE;
    this.jwksUrl = process.env.CLERK_JWKS_URL;
    const configuredTtl = Number(process.env.CLERK_JWKS_CACHE_TTL);
    this.cacheTtlMs = Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_CACHE_TTL_MS;
    this.httpClient = axios.create();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.securityEnabled) {
      return true;
    }
    if (!this.jwksUrl || !this.issuer) {
      throw new UnauthorizedException('Clerk authentication is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const payload = await this.verifyJwt(token);
      (request as Request & { auth?: unknown }).auth = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Clerk token');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      return undefined;
    }
    if (Array.isArray(authorization)) {
      const value = authorization.find(Boolean);
      return value ? this.normalizeBearerToken(value) : undefined;
    }
    return this.normalizeBearerToken(authorization);
  }

  private normalizeBearerToken(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.startsWith('Bearer ')) {
      return trimmed.slice(7).trim() || undefined;
    }
    return trimmed;
  }

  private async verifyJwt(token: string): Promise<Record<string, unknown>> {
    const segments = token.split('.');
    if (segments.length !== 3) {
      throw new Error('Token is not a JWT');
    }
    const [headerSegment, payloadSegment, signatureSegment] = segments;
    const header = JSON.parse(Buffer.from(headerSegment, 'base64url').toString('utf8')) as {
      alg: string;
      kid?: string;
      typ?: string;
    };

    if (header.alg !== 'RS256') {
      throw new Error('Unsupported JWT algorithm');
    }
    if (!header.kid) {
      throw new Error('JWT header missing key identifier');
    }

    const jwk = await this.getSigningKey(header.kid);
    if (!jwk) {
      throw new Error('Unable to find signing key');
    }

    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const data = Buffer.from(`${headerSegment}.${payloadSegment}`);
    const signature = Buffer.from(signatureSegment, 'base64url');

    const isValid = verify('RSA-SHA256', data, publicKey, signature);
    if (!isValid) {
      throw new Error('JWT signature verification failed');
    }

    const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8')) as Record<string, unknown>;

    this.assertPayloadClaims(payload);

    return payload;
  }

  private assertPayloadClaims(payload: Record<string, unknown>): void {
    const now = Math.floor(Date.now() / 1000);
    const exp = typeof payload['exp'] === 'number' ? payload['exp'] : undefined;
    const nbf = typeof payload['nbf'] === 'number' ? payload['nbf'] : undefined;
    const iss = typeof payload['iss'] === 'string' ? payload['iss'] : undefined;
    const audClaim = payload['aud'];

    if (!exp || exp <= now) {
      throw new Error('JWT is expired');
    }
    if (nbf && nbf > now) {
      throw new Error('JWT is not valid yet');
    }
    if (iss !== this.issuer) {
      throw new Error('Unexpected JWT issuer');
    }
    if (this.audience) {
      if (typeof audClaim === 'string' && audClaim !== this.audience) {
        throw new Error('Unexpected JWT audience');
      }
      if (Array.isArray(audClaim) && !audClaim.includes(this.audience)) {
        throw new Error('Unexpected JWT audience');
      }
      if (audClaim === undefined) {
        throw new Error('JWT audience missing');
      }
    }
  }

  private async getSigningKey(kid: string): Promise<JsonWebKeyWithKid | undefined> {
    const cached = this.jwksCache.get(kid);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.key;
    }

    const jwks = await this.fetchJwks();
    const matchingKey = jwks.keys.find((key) => key.kid === kid);

    if (matchingKey) {
      const expiresAt = Date.now() + this.cacheTtlMs;
      this.jwksCache.set(kid, { key: matchingKey, expiresAt });
    }

    return matchingKey;
  }

  private async fetchJwks(): Promise<JwksResponse> {
    try {
      const response = await this.httpClient.get<JwksResponse>(this.jwksUrl!);
      if (!response.data || !Array.isArray(response.data.keys)) {
        throw new Error('Malformed JWKS response');
      }
      return response.data;
    } catch (error) {
      throw new Error('Unable to download Clerk JWKS');
    }
  }
}
