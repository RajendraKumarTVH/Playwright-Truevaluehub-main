export class CountryDataMasterDto {
  countryId: number;
  countryName: string;
  countryCode: string;
  imputeRateOfInterest: number;
  scrapPriceGroup: string;
  machiningScrapPriceGroup: string;
  selected: boolean;
  toolingLocationCountryId: number;
  isO2: string;
  isO3: string;
  packagingPriceMultiplier: number;
  regionId: number;
  annualHours?: number;
}
