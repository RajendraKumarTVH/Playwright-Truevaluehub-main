import { SharedService } from './shared';
import { LaborRateMasterDto, ProcessInfoDto } from 'src/app/shared/models';

export class ManufacturingSustainabilityCalculatorService {
  constructor(private shareService: SharedService) { }

  public doCostCalculationsForSustainability(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRate: LaborRateMasterDto[]): ProcessInfoDto {
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && !!manufactureInfo.esgImpactElectricityConsumption) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let esgImpactElectricityConsumption = this.shareService.isValidNumber(
        Number(manufactureInfo?.machineMaster?.totalPowerKW) * Number(manufactureInfo?.machineMaster?.powerUtilization) * Number(laborRate[0]?.powerESG)
      );
      if (manufactureInfo.esgImpactElectricityConsumption) {
        esgImpactElectricityConsumption = this.shareService.checkDirtyProperty('co2KwHr', fieldColorsList) ? manufacturingObj?.esgImpactElectricityConsumption : esgImpactElectricityConsumption;
      }
      manufactureInfo.esgImpactElectricityConsumption = esgImpactElectricityConsumption;
    }

    if (manufactureInfo.isesgImpactFactoryImpactDirty && !!manufactureInfo.esgImpactFactoryImpact) {
      manufactureInfo.esgImpactFactoryImpact = Number(manufactureInfo.esgImpactFactoryImpact);
    } else {
      let esgImpactFactoryImpact = this.shareService.isValidNumber(
        (Number(manufactureInfo.cycleTime) / (3600 * Number(manufactureInfo.efficiency)) + Number(manufactureInfo.setUpTime) / Number(manufactureInfo.lotSize) / 60) *
        Number(manufactureInfo.esgImpactElectricityConsumption)
      );
      if (manufactureInfo.esgImpactFactoryImpact) {
        esgImpactFactoryImpact = this.shareService.checkDirtyProperty('co2KgPart', fieldColorsList) ? manufacturingObj?.esgImpactFactoryImpact : esgImpactFactoryImpact;
      }
      manufactureInfo.esgImpactFactoryImpact = esgImpactFactoryImpact;
    }

    manufactureInfo.esgImpactAnnualUsageHrs = this.shareService.isValidNumber(
      (manufactureInfo.setUpTime * ((manufactureInfo?.eav ?? 0) / (manufactureInfo.lotSize ?? 0)) / 60) + (manufactureInfo.cycleTime * (manufactureInfo?.eav ?? 0)) / 3600
    );

    manufactureInfo.esgImpactAnnualKgCO2 = this.shareService.isValidNumber(manufactureInfo.esgImpactElectricityConsumption * manufactureInfo.esgImpactAnnualUsageHrs);

    manufactureInfo.esgImpactAnnualKgCO2Part = this.shareService.isValidNumber(manufactureInfo.esgImpactAnnualKgCO2 / (manufactureInfo?.eav ?? 0));

    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }
}
