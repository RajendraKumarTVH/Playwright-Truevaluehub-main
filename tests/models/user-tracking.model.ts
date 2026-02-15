export class UserTrackingDto {
  id: number;
  userId: number;
  loginDetails: string;
  countryCode?: string;
  countryName?: string;
  state?: string;
  city?: string;
  postal?: string;
  latitude?: string;
  longitude?: string;
  ipAddress?: string;
  createDate?: Date;
}
