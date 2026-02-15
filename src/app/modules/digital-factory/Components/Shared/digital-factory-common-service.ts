import { Injectable } from '@angular/core';
import { DfSupplierDirectoryMasterDto } from '../../Models/df-supplier-directory-master-dto';
import { DfSupplierProfileInfo } from '../../Models/df-supplier-profile-info';
import { Subject } from 'rxjs';
import { DfSupplierCostStructureInfo } from '../../Models/df-supplier-cost-structure-info';
import { DfSupplierFactoryAssumptionInfo } from '../../Models/df-supplier-factory-assumption-info';
import { DfMaterialInfoDto } from '../../Models/df-material-info-dto';
import { DigitalFactoryDtoNew } from '../../Models/digital-factory-dto';
import { DfMachineInfoDto } from '../../Models/df-machine-info-dto';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
@Injectable({
  providedIn: 'root',
})
export class DigitalFactoryCommonService {
  suppplierDataLoaded = new Subject<void>();
  suppliersMasterDetails?: DfSupplierDirectoryMasterDto[];
  appliedSearchModel: SearchBarModelDto[];
  factoryHoursUpdated$ = new Subject<DfSupplierDirectoryMasterDto>();

  private _dfSupplierMasterDetails: DfSupplierDirectoryMasterDto;
  private _digitalFactoryDetails?: DigitalFactoryDtoNew;

  get dfSupplierMasterDetails() {
    return this._dfSupplierMasterDetails;
  }

  set dfSupplierMasterDetails(dfSupplierMasterDetails) {
    this._dfSupplierMasterDetails = dfSupplierMasterDetails;
  }

  get digitalFacotryDetails() {
    return this._digitalFactoryDetails;
  }

  set digitalFacotryDetails(digitalFacotryDetails) {
    this._digitalFactoryDetails = digitalFacotryDetails;
  }

  getProfileDetails(): DfSupplierProfileInfo {
    return {
      supplierId: this.dfSupplierMasterDetails?.supplierId,
      supplierName: this.dfSupplierMasterDetails?.vendorName,
      address: this.dfSupplierMasterDetails?.address,
      mfgCountry: this.dfSupplierMasterDetails?.countryName,
      mfgRegion: this.dfSupplierMasterDetails?.regionName,
      paymentTerms: this.digitalFacotryDetails?.paymentTerms,
      anualRevenue: this.digitalFacotryDetails?.anulSpendType?.toString(),
      incoterms: this.digitalFacotryDetails?.incoterms?.toString(),
      vmi: this.digitalFacotryDetails?.vmiType?.toString(),
    };
  }

  getSupplierMasterDetailsByIds(supplierIds: number[]): DfSupplierDirectoryMasterDto[] {
    return this.suppliersMasterDetails?.filter((s) => supplierIds.includes(s.supplierId));
  }

  getLabourAssumptionDetails() {
    return false; // we can remove this line while adding actual implementation
  }

  getPowerAssumptionsDetails() {
    return false; // we can remove this line while adding actual implementation
  }

  getCostStructureDetails(): DfSupplierCostStructureInfo {
    return {
      carryingCostsForFinishedGoods: this.dfSupplierMasterDetails?.carryingCostsForFinishedGoods,
      carryingCostsForPaymentTerms: this.dfSupplierMasterDetails?.carryingCostsForPaymentTerms,
      carryingCostsForRawMaterial: this.dfSupplierMasterDetails?.carryingCostsForRawMaterial,
      factoryOverhead: this.dfSupplierMasterDetails?.factoryOverhead,
      interestRate: this.dfSupplierMasterDetails?.interestRate,
      materialOverhead: this.dfSupplierMasterDetails?.materialOverhead,
      profitMargin: this.dfSupplierMasterDetails?.profitMargin,
      sgAndA: this.dfSupplierMasterDetails?.sgAndA,
    };
  }

  getFactoryAssumptionDetails(): DfSupplierFactoryAssumptionInfo {
    return {
      hoursPerShift: this.dfSupplierMasterDetails?.hoursPerShift,
      shiftsPerDay: this.dfSupplierMasterDetails?.shiftsPerDay,
      totalBreaksPerShift: this.dfSupplierMasterDetails?.totalBreaksPerShift,
      workingDaysPerYear: this.dfSupplierMasterDetails?.workingDaysPerYear,
    };
  }

  getMaterialInfoList(): DfMaterialInfoDto[] {
    return this.digitalFacotryDetails?.digitalFactoryMaterialInfos;
  }

  getMachineInfoList(): DfMachineInfoDto[] {
    return this.digitalFacotryDetails?.digitalFactoryMachineInfos;
  }
}
