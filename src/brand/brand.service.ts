import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class BrandService {
  async getBrandInfo(domain: string) {
    const apiKey = process.env.BRANDFETCH_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Brandfetch API key is not configured');
    }

    try {
      const response = await axios.get(
        `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.handleAxiosError(error);
      }

      throw new InternalServerErrorException('Failed to retrieve brand information');
    }
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Invalid Brandfetch API key');
      }

      if (status === 404) {
        throw new NotFoundException('Brand not found');
      }

      throw new HttpException(data ?? 'Brandfetch API error', status);
    }

    throw new InternalServerErrorException('No response received from Brandfetch API');
  }
}
