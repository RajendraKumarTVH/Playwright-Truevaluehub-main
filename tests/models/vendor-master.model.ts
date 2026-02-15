import { Industry } from './industries.model';

export interface VendorDto {
  id: number;
  vendorName: string;
  country: number;
  regionId: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  vendorId?: string;
  isActive: boolean;
  anulRevType: number;
  dunsId: number;
  taxId: number;
  contactName: string;
  contactEmail: string;
  contactPhNum: string;
  anulSpendType: number;
  onContract?: boolean;
  lastPriceNegoDt: Date;
  paymentTerms?: number;
  incoterms?: number;
  vmiType?: number;
  industrySelected?: Industry[];
}
