import { CountryDataMasterDto } from 'src/app/shared/models';
import { RegionMasterDto } from 'src/app/shared/models/region-master-dto';

export interface DFSupplierCountDetails {
  totalSuppliers?: number;
  activeSuppliers?: number;
  categories?: number;
  countryList?: CountryDataMasterDto[];
  regionList?: RegionMasterDto[];
  tabIndex?: number;
}
