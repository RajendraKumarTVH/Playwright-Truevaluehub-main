import { CountryDataMasterDto } from './country-data-master.model';
import { LaborRateMasterDto } from './labor-rate-master.model';

export class MachineMasterRequestDto {
  machineId?: number;
  processTypeId: number;
  supplierId: number;
  countryData: CountryDataMasterDto;
  laborRate: LaborRateMasterDto;
  regionId?: number;
  marketMonth?: string;
}

export class LaborRateMasterRequestDto {
  supplierId: number;
  countryId: number;
  regionId: number;
  marketMonth?: string;
  machineMasterId?: number;
}
