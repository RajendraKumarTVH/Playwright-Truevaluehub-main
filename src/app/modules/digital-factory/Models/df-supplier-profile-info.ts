export interface DfSupplierProfileInfo {
  supplierName: string;
  supplierId: number;
  address?: string;
  mfgRegion: string;
  mfgCountry: string;
  paymentTerms?: number;
  incoterms?: string;
  vmi?: string;
  anualRevenue?: string;
  industries?: string;
}
