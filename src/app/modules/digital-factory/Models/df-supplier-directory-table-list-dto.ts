import { CountryDataMasterDto } from 'src/app/shared/models';
import { DfSupplierDirectoryMasterDto } from './df-supplier-directory-master-dto';
import { RegionMasterDto } from 'src/app/shared/models/region-master-dto';

export interface DfSupplierDirectoryTableListDto {
  dfSupplierDirectoryMasterDtos: DfSupplierDirectoryMasterDto[];
  totalSuppliers: number;
  countries?: CountryDataMasterDto[];
  regions?: RegionMasterDto[];
}
