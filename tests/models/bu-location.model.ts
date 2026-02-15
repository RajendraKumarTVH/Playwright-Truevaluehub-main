import { Location } from './customer.model';

export interface BuLocationDto extends Location {
  buId: number | undefined;
  regionId?: number;
  buName: string;
  type?: number;
  latitude?: number;
  longitude?: number;
}
