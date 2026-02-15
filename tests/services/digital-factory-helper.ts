import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { MedbMachinesMasterDto } from 'src/app/shared/models/medb-machine.model';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { SharedService } from './shared';
import { ProcessInfoDto } from 'src/app/shared/models/process-info.model';
import { LaborRateMasterDto } from 'src/app/shared/models/labor-rate-master.model';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { MaterialInfoDto } from 'src/app/shared/models/material-info.model';
import { DFMaterialModel } from 'src/app/shared/models/df-material-model';
import { CountryDataMasterDto, MaterialMarketDataDto, MaterialMasterDto } from 'src/app/shared/models';
import { DfMachineInfoDto } from 'src/app/modules/digital-factory/Models/df-machine-info-dto';
import { DfMaterialInfoDto } from 'src/app/modules/digital-factory/Models/df-material-info-dto';

/**
 * Digital Factory Helper for Playwright Tests
 * Converted from Angular service to work with Playwright test framework
 * Handles material info calculations, MHR calculations, and supplier overhead values
 */
export class DigitalFactoryHelper {
  supplierInfo?: DigitalFactoryDtoNew;

  constructor(
    private readonly sharedService: SharedService
  ) { }

  getMaterialInfo(
    dfMatInfo: DfMaterialInfoDto,
    stockFormName?: string,
    stockFormMultiplier?: number,
    stockFormList?: any,
    materialInfo?: MaterialInfoDto,
    materialMaster?: MaterialMasterDto,
    materialMarket?: MaterialMarketDataDto,
    fieldColorsList?: FieldColorsDto[]
  ): DFMaterialModel {
    const getMatValues = (dfHelperMethod: () => any, masterData: any) => {
      const dfValue = dfHelperMethod();
      return dfValue ? dfValue : masterData;
    };
    let matPrice = getMatValues(() => dfMatInfo?.price, stockFormMultiplier && materialMarket?.price ? materialMarket.price * stockFormMultiplier : materialInfo?.materialPricePerKg || materialMarket?.price || 0);
    let volumePurchased = getMatValues(() => dfMatInfo?.volumePurchased, materialInfo?.volumePurchased ?? 0);
    let scrapPrice = getMatValues(() => dfMatInfo?.scrapPrice, materialMarket?.generalScrapPrice);
    let volumeDiscount = materialInfo?.volumeDiscountPer ?? 0;
    let dfStockFormName = stockFormList?.find((x: any) => x.stockFormId === dfMatInfo?.stockFormId)?.formName;
    let stockForm = dfStockFormName ?? stockFormName;
    if (fieldColorsList && this.sharedService.checkDirtyProperty('matPrice', fieldColorsList) && materialInfo) {
      matPrice = materialInfo?.materialPricePerKg;
    }
    if (fieldColorsList && this.sharedService.checkDirtyProperty('volumePurchased', fieldColorsList) && materialInfo) {
      volumePurchased = materialInfo?.volumePurchased;
    }
    if (fieldColorsList && this.sharedService.checkDirtyProperty('scrapPrice', fieldColorsList) && materialInfo) {
      scrapPrice = materialInfo?.scrapPricePerKg;
    }
    if (fieldColorsList && this.sharedService.checkDirtyProperty('stockForm', fieldColorsList) && materialInfo) {
      stockForm = materialInfo?.stockForm;
    }
    if (materialMaster) {
      volumeDiscount = getMatValues(() => this.transformDiscountPercentageToValue(dfMatInfo?.discountPercent), this.getVolumeDiscount(Number(volumePurchased ?? 0), materialMaster));
    }
    volumeDiscount = volumeDiscount > 0 ? Number(this.sharedService.transformNumberTwoDecimal(this.transformDiscountValueToPercentage(volumeDiscount))) : volumeDiscount;
    if (fieldColorsList && this.sharedService.checkDirtyProperty('volumeDiscountPer', fieldColorsList) && materialInfo) {
      volumeDiscount = materialInfo?.volumeDiscountPer ?? 0;
    }
    const matGrossPrice = volumeDiscount > 0 ? this.sharedService.isValidNumber(matPrice * this.transformDiscountPercentageToValue(volumeDiscount)) : matPrice;

    return {
      matPrice,
      scrapPrice: scrapPrice,
      volumeDiscount: volumeDiscount,
      volumePurchased: volumePurchased,
      matGrossPrice: matGrossPrice,
      stockForm: stockForm,
    };
  }

  getVolumeDiscount(volumePurchased: number, materialDescription: MaterialMasterDto) {
    if (volumePurchased < 1) {
      return 0;
    }
    if (volumePurchased >= 1 && volumePurchased < 25) {
      return materialDescription.oneMTDiscount;
    }
    if (volumePurchased >= 25 && volumePurchased < 50) {
      return materialDescription.twentyFiveMTDiscount;
    }
    return materialDescription.fiftyMTDiscount;
  }

  calculateAndGetMhrValue(
    supplierInfo?: DigitalFactoryDtoNew,
    processInfo?: ProcessInfoDto,
    machineMasterDto?: MedbMachinesMasterDto,
    laborRateInfo?: LaborRateMasterDto,
    countryListDto?: CountryDataMasterDto[],
    fieldColorsList?: FieldColorsDto[]
  ): any {
    this.supplierInfo = supplierInfo;
    const machineMaster = machineMasterDto;
    const mfrCountryId = laborRateInfo?.countryId;
    const countryData = countryListDto?.find((x) => x.countryId === mfrCountryId);
    let modifiedMhr;
    if (fieldColorsList && this.sharedService.checkDirtyProperty('machineHourRate', fieldColorsList)) {
      modifiedMhr = processInfo?.machineHourRate;
    }
    if (!machineMaster?.machineID) return { defaultMhr: machineMaster?.machineHourRate, calculatedMhr: modifiedMhr ?? machineMaster?.machineHourRate };
    if (!this.supplierInfo?.digitalFactoryMachineInfos) return { defaultMhr: machineMaster?.machineHourRate, calculatedMhr: modifiedMhr ?? machineMaster?.machineHourRate };

    const dfMachineInfo = this.supplierInfo.digitalFactoryMachineInfos.find((x) => x.machineMasterId?.toString() === machineMaster.machineID.toString());
    if (!dfMachineInfo) return { defaultMhr: machineMaster?.machineHourRate, calculatedMhr: modifiedMhr ?? machineMaster?.machineHourRate };
    const anualHours = (this.supplierInfo.supplierDirectoryMasterDto ? this.getAnualHours(this.supplierInfo.supplierDirectoryMasterDto) : 0) || countryData?.annualHours;
    if (!anualHours) return { defaultMhr: machineMaster?.machineHourRate, calculatedMhr: modifiedMhr ?? machineMaster?.machineHourRate };
    const investmentCost = dfMachineInfo?.investmentCost ?? (machineMaster?.machineMarketDtos?.[0]?.mcInvestment || 0);
    const interestRate = dfMachineInfo?.interestRate ?? countryData?.imputeRateOfInterest;
    const rentRate = dfMachineInfo?.rentRate ?? laborRateInfo?.rentRate;
    const totalPowerCost = dfMachineInfo?.powerCost ?? laborRateInfo?.powerCost;
    const totalPowerKW = dfMachineInfo?.ratedPower ?? machineMaster?.totalPowerKW;
    const suppliesCost = dfMachineInfo?.suppliesCost ?? (machineMaster?.machineMarketDtos?.[0]?.suppliesCost || 0);
    const maintainanceCost = dfMachineInfo?.utilization ?? (machineMaster?.machineMarketDtos?.[0]?.maintanenceCost || 0);
    const powerUtilization = dfMachineInfo?.powerUtilization ?? machineMaster?.powerUtilization;
    const machineOverhead = machineMaster?.machineMarketDtos?.[0]?.machineOverheadRate || 1;
    const installationFactor = dfMachineInfo?.installationFactor ?? (machineMaster?.machineMarketDtos?.[0]?.installationFactor || 0);
    const depreciatioNInYears = dfMachineInfo?.age ?? (machineMaster?.machineMarketDtos?.[0]?.depreciatioNInYears || 0);

    const mhrValue =
      ((investmentCost * (1 + installationFactor)) / (depreciatioNInYears ?? 0) / anualHours +
        (investmentCost * (1 + installationFactor) * (interestRate ?? 0)) / anualHours +
        (totalPowerKW ?? 0) * (totalPowerCost ?? 0) * (machineMaster?.machineMarketDtos?.[0]?.efficiency || 0) * (powerUtilization ?? 0) +
        (((((machineMaster?.maxLength ?? 0) * (machineMaster?.maxWidth ?? 0) * (rentRate ?? 0)) / 1000000) * 12) / anualHours) * 1.75 +
        (investmentCost * (1 + installationFactor) * (maintainanceCost ?? 0)) / anualHours +
        (investmentCost * (1 + installationFactor) * (suppliesCost ?? 0)) / anualHours) *
      machineOverhead;

    const defaultMhr = this.sharedService.isValidNumber(mhrValue);
    const calculatedMhr = modifiedMhr || defaultMhr;

    return { defaultMhr, calculatedMhr };
  }

  getAnualHours(details: DfSupplierDirectoryMasterDto) {
    if (!details) return 0;
    return Math.floor(((details?.hoursPerShift ?? 0) * (details?.shiftsPerDay ?? 0) - (details?.totalBreaksPerShift ?? 0) / 60) * (details?.workingDaysPerYear ?? 0));
  }

  /**
   * Set supplier info directly (for Playwright tests)
   * @param supplierInfo Digital Factory supplier information
   */
  setSupplierInfo(supplierInfo: DigitalFactoryDtoNew): void {
    this.supplierInfo = supplierInfo;
  }


  getDFLowSkilledLaborRate() {
    if (!this.supplierInfo?.supplierDirectoryMasterDto) return undefined;
    return this.supplierInfo?.supplierDirectoryMasterDto?.laborLowSkilledCost;
  }

  getNoOfDirectSupplierLabors(machineInfo: DfMachineInfoDto) {
    if (!machineInfo) return undefined;
    return this.sharedService.isValidNumber(
      Number(machineInfo.lowSkilledLaborersNeeded) +
      this.sharedService.isValidNumber(Number(machineInfo.semiSkilledLaborersNeeded)) +
      this.sharedService.isValidNumber(Number(machineInfo.lowSkilledLaborersNeeded)) +
      this.sharedService.isValidNumber(Number(machineInfo.specialSkilledLaborersNeeded))
    );
  }

  getSupplierOverHeadValues(supplierMaster: DfSupplierDirectoryMasterDto, costOverHeadProfitDto?: CostOverHeadProfitDto) {
    if (!supplierMaster || supplierMaster?.interestRate === undefined || supplierMaster?.interestRate === 0) {
      return {
        iccPer: costOverHeadProfitDto?.iccPer,
        mohPer: costOverHeadProfitDto?.mohPer,
        fohPer: costOverHeadProfitDto?.fohPer,
        sgaPer: costOverHeadProfitDto?.sgaPer,
        paymentTermsPer: costOverHeadProfitDto?.paymentTermsPer,
        fgiccPer: costOverHeadProfitDto?.fgiccPer,
        materialProfitPer: costOverHeadProfitDto?.materialProfitPer,
        processProfitPer: costOverHeadProfitDto?.processProfitPer,
        profitCost: costOverHeadProfitDto?.profitCost,
      };
    }
    const dfIccPer = supplierMaster?.interestRate;
    let rawMatPer;
    let fgPer;
    if (dfIccPer && dfIccPer > 0) {
      rawMatPer = dfIccPer / 2;
      fgPer = dfIccPer / 2;
    }
    const iccPer = rawMatPer ? this.transformNumberTwoDecimal(rawMatPer) : costOverHeadProfitDto?.iccPer;
    const mohPer = supplierMaster?.materialOverhead ? this.transformNumberTwoDecimal(supplierMaster?.materialOverhead) : costOverHeadProfitDto?.mohPer;
    const fohPer = supplierMaster?.factoryOverhead ? this.transformNumberTwoDecimal(supplierMaster?.factoryOverhead) : costOverHeadProfitDto?.fohPer;
    const sgaPer = supplierMaster?.sgAndA ? this.transformNumberTwoDecimal(supplierMaster?.sgAndA) : costOverHeadProfitDto?.sgaPer;
    const paymentTermsPer = supplierMaster?.carryingCostsForPaymentTerms ? this.transformNumberTwoDecimal(supplierMaster?.carryingCostsForPaymentTerms) : costOverHeadProfitDto?.paymentTermsPer;
    const fgiccPer = fgPer ? this.transformNumberTwoDecimal(fgPer) : costOverHeadProfitDto?.fgiccPer;
    const matProfitPer = supplierMaster?.materialProfitMargin ? this.transformNumberTwoDecimal(supplierMaster?.materialProfitMargin) : costOverHeadProfitDto?.materialProfitPer;
    const processProfitPer = supplierMaster?.manufacturingProfitMargin ? this.transformNumberTwoDecimal(supplierMaster?.manufacturingProfitMargin) : costOverHeadProfitDto?.processProfitPer;
    const profitCost = supplierMaster?.profitMargin ? this.transformNumberTwoDecimal(supplierMaster?.profitMargin) : costOverHeadProfitDto?.profitCost;

    return {
      iccPer: iccPer,
      mohPer: mohPer,
      fohPer: fohPer,
      sgaPer: sgaPer,
      paymentTermsPer: paymentTermsPer,
      fgiccPer: fgiccPer,
      materialProfitPer: matProfitPer,
      processProfitPer: processProfitPer,
      profitCost: profitCost,
    };
  }

  private getDFTotalPowerCost() {
    if (!this.supplierInfo?.supplierDirectoryMasterDto) return undefined;
    const supplierMaster = this.supplierInfo?.supplierDirectoryMasterDto;

    const costValues = [
      (supplierMaster?.coalCost ?? 0) * (supplierMaster?.coalPortion ?? 0),
      (supplierMaster?.windCost ?? 0) * (supplierMaster?.windPortion ?? 0),
      (supplierMaster?.naturalGasCost ?? 0) * (supplierMaster?.naturalGasPortion ?? 0),
      (supplierMaster?.nuclearCost ?? 0) * (supplierMaster?.nuclearPortion ?? 0),
      (supplierMaster?.geothermalCost ?? 0) * (supplierMaster?.geothermalPortion ?? 0),
      (supplierMaster?.otherNonRenewableCost ?? 0) * (supplierMaster?.otherNonRenewablePortion ?? 0),
      (supplierMaster?.otherRenewableCost ?? 0) * (supplierMaster?.otherRenewablePortion ?? 0),
    ].filter((x) => x !== 0 && x !== null);

    const totalPowerSupply = this.getDFTotalPowerSupply();
    return this.sharedService.isValidNumber(costValues.reduce((acc, num) => acc + num, 0) / (totalPowerSupply ?? 1));
  }

  private getDFTotalPowerSupply() {
    if (!this.supplierInfo?.supplierDirectoryMasterDto) return undefined;
    const supplierMaster = this.supplierInfo?.supplierDirectoryMasterDto;
    const powerSupply =
      this.sharedService.isValidNumber(Number(supplierMaster.coalPortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.windPortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.naturalGasPortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.nuclearPortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.geothermalPortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.otherNonRenewablePortion)) +
      this.sharedService.isValidNumber(Number(supplierMaster.otherRenewablePortion));
    return powerSupply > 0 ? powerSupply : undefined;
  }

  private transformNumberTwoDecimal(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return value.toFixed(2);
    else {
      return 0;
    }
  }

  private transformDiscountPercentageToValue(discountPer?: number) {
    if (discountPer === undefined || discountPer === null) return 1;
    return 1 - discountPer / 100;
  }

  private transformDiscountValueToPercentage(discountVal: number) {
    return (1 - discountVal) * 100;
  }
}
