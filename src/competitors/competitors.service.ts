import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type LatLngLiteral = { lat: number; lng: number };

type FindPlaceCandidate = {
  place_id: string;
  name: string;
  geometry?: {
    location?: LatLngLiteral;
  };
};

type FindPlaceResponse = {
  status: string;
  candidates: FindPlaceCandidate[];
  error_message?: string;
};

type NearbySearchResult = {
  place_id: string;
  name: string;
  geometry?: {
    location?: LatLngLiteral;
  };
};

type NearbySearchResponse = {
  status: string;
  results: NearbySearchResult[];
  error_message?: string;
};

type FindNearbyCompetitorsOptions = {
  input: string;
  radius?: number;
  type?: string;
  keyword?: string;
};

@Injectable()
export class CompetitorsService {
  private readonly findPlaceUrl =
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  private readonly nearbySearchUrl =
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  async findNearbyCompetitors(options: FindNearbyCompetitorsOptions) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Google Maps API key is not configured',
      );
    }

    const { input, radius, type, keyword } = options;

    try {
      const findPlace = await axios.get<FindPlaceResponse>(this.findPlaceUrl, {
        params: {
          input,
          inputtype: 'textquery',
          fields: 'place_id,name,geometry',
          key: apiKey,
        },
      });

      const findPlaceData = findPlace.data;
      const candidate = this.extractCandidate(findPlaceData);
      const location = candidate.geometry?.location;

      if (!location) {
        throw new InternalServerErrorException(
          'Google Places response did not include a location for the business',
        );
      }

      const nearbyParams: Record<string, string> = {
        location: `${location.lat},${location.lng}`,
        radius: String(radius ?? 2000),
        key: apiKey,
      };

      if (type) {
        nearbyParams.type = type;
      }

      if (keyword) {
        nearbyParams.keyword = keyword;
      }

      const nearbySearch = await axios.get<NearbySearchResponse>(
        this.nearbySearchUrl,
        {
          params: nearbyParams,
        },
      );

      const nearbyData = nearbySearch.data;
      this.ensureNearbySearchSucceeded(nearbyData);

      const competitors = (nearbyData.results ?? []).filter(
        result => result.place_id !== candidate.place_id,
      );

      return {
        origin: candidate,
        competitors,
        nearbyStatus: nearbyData.status,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.handleAxiosError(error);
      }

      throw error;
    }
  }

  private extractCandidate(data: FindPlaceResponse): FindPlaceCandidate {
    if (data.status === 'ZERO_RESULTS' || data.candidates.length === 0) {
      throw new NotFoundException('No matching place found for the given input');
    }

    if (data.status !== 'OK') {
      throw new InternalServerErrorException(
        this.composeErrorMessage(
          'Google Places Find Place error',
          data.status,
          data.error_message,
        ),
      );
    }

    return data.candidates[0];
  }

  private ensureNearbySearchSucceeded(data: NearbySearchResponse) {
    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return;
    }

    throw new InternalServerErrorException(
      this.composeErrorMessage(
        'Google Places Nearby Search error',
        data.status,
        data.error_message,
      ),
    );
  }

  private composeErrorMessage(prefix: string, status: string, message?: string) {
    return message ? `${prefix}: ${status} - ${message}` : `${prefix}: ${status}`;
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as { error_message?: string } | undefined)?.
        error_message;

      if (status === 400) {
        throw new BadRequestException(
          errorMessage ?? 'Invalid request sent to Google Maps API',
        );
      }

      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Invalid Google Maps API key');
      }

      throw new HttpException(
        errorMessage ?? 'Google Maps API error',
        status,
      );
    }

    throw new InternalServerErrorException(
      'No response received from Google Maps API',
    );
  }
}
