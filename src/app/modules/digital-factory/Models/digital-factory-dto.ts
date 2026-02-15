import { DfMachineInfoDto } from './df-machine-info-dto';
import { DfMaterialInfoDto } from './df-material-info-dto';
import { DfSupplierDirectoryMasterDto } from './df-supplier-directory-master-dto';

export class DigitalFactoryDtoNew {
  digitalFactoryId?: number;
  supplierId: number;
  vendorName?: string;
  paymentTerms?: number;
  incoterms?: number;
  vmiType?: number;
  anulSpendType?: number;
  contractStatus?: string;
  vendorStatus?: number;
  comments?: string;
  clientSupplierContract?: string;
  uniqueCategories?: string;
  isDefault?: boolean;
  digitalFactoryMaterialInfos?: DfMaterialInfoDto[];
  digitalFactoryMachineInfos?: DfMachineInfoDto[];
  supplierDirectoryMasterDto?: DfSupplierDirectoryMasterDto;
}
