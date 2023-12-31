import { Location } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class LocationEntity implements Location {
  id: number;
  latitude: Decimal;
  longitude: Decimal;
  placeId: string | null;
}
