import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { SearchPlacesDto } from './dto/search-places.dto';

type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
};

type SearchNearbyResponse = {
  places?: GooglePlace[];
};

type NearbyPlace = {
  id: string;
  name: string | null;
  coords: { lat: number; lng: number };
  rating?: number;
  reviews?: number;
};

@Injectable()
export class PlacesService {
  private readonly searchNearbyUrl =
    'https://places.googleapis.com/v1/places:searchNearby';

  async searchNearby(dto: SearchPlacesDto): Promise<NearbyPlace[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Google Maps API key is not configured',
      );
    }

    const { lat, lng } = dto;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('lat and lng must be valid numbers');
    }

    const radius = dto.radius ?? 16_093; // ~10 miles
    const keyword = dto.keyword?.trim().length ? dto.keyword : 'indian,south indian';

    try {
      const response = await axios.post<SearchNearbyResponse>(
        this.searchNearbyUrl,
        {
          includedPrimaryTypes: ['restaurant'],
          keyword,
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.location,places.rating,places.userRatingCount',
          },
        },
      );

      const places = (response.data.places ?? []).filter(place => {
        const latValue = place.location?.latitude;
        const lngValue = place.location?.longitude;
        return (
          typeof latValue === 'number' &&
          Number.isFinite(latValue) &&
          typeof lngValue === 'number' &&
          Number.isFinite(lngValue)
        );
      });

      return places.map(place => {
        const latValue = place.location?.latitude as number;
        const lngValue = place.location?.longitude as number;

        return {
          id: place.id,
          name: place.displayName?.text ?? null,
          coords: {
            lat: latValue,
            lng: lngValue,
          },
          rating: place.rating,
          reviews: place.userRatingCount,
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.handleAxiosError(error);
      }

      throw new InternalServerErrorException(
        'Failed to retrieve nearby restaurants',
      );
    }
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as { error?: { message?: string } } | undefined)?.error
        ?.message;

      if (status === 400) {
        throw new BadRequestException(
          errorMessage ?? 'Invalid request sent to Google Places API',
        );
      }

      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Invalid Google Maps API key');
      }

      throw new HttpException(
        errorMessage ?? 'Google Places API error',
        status,
      );
    }

    throw new InternalServerErrorException(
      'No response received from Google Places API',
    );
  }
}
