export interface CustomerDto {
  id: number;
  name: string;
  location: Location;
  info: CustomerInfo;
  admin: ClientAdmin;
  isActive: boolean | true;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
  country: number;
}

export interface CustomerInfo {
  annualRevenueType: number;
  dunsId: number | 0;
  taxId: number | 0;
  unitType: number | null;
  currencyType: number | null;
  avgCostOfCapital?: number;
}

export interface ClientAdmin {
  adminName: string | null;
  adminEmail: string;
  adminPhoneNumber: string | null;
}
