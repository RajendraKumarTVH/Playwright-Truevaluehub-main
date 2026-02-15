import { MaterialInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';


export class MaterialSustainabilityCalculationService {
  constructor(private shareService: SharedService) { }

  public calculationsForMaterialSustainability(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isEsgImpactCO2KgDirty && !!materialInfo.esgImpactCO2Kg) {
      materialInfo.esgImpactCO2Kg = Number(materialInfo.esgImpactCO2Kg);
    } else {
      materialInfo.esgImpactCO2Kg = this.shareService.checkDirtyProperty('co2KgMaterial', fieldColorsList)
        ? selectedMaterialInfo?.esgImpactCO2Kg
        : Number(materialInfo?.materialMarketData?.esgImpactCO2Kg);
    }

    if (materialInfo.isEsgImpactCO2KgScrapDirty && !!materialInfo.esgImpactCO2KgScrap) {
      materialInfo.esgImpactCO2KgScrap = Number(materialInfo.esgImpactCO2KgScrap);
    } else {
      materialInfo.esgImpactCO2KgScrap = this.shareService.checkDirtyProperty('co2KgScrap', fieldColorsList)
        ? selectedMaterialInfo?.esgImpactCO2KgScrap
        : Number(materialInfo?.materialMarketData?.esgImpactCO2Kg);
    }

    if (materialInfo.isEsgImpactCO2KgPartDirty && !!materialInfo.esgImpactCO2KgPart) {
      materialInfo.esgImpactCO2KgPart = Number(materialInfo.esgImpactCO2KgPart);
    } else {
      let esgImpactCO2KgPart = this.shareService.isValidNumber(
        (materialInfo?.grossWeight / 1000) * materialInfo?.esgImpactCO2Kg - (materialInfo?.scrapWeight / 1000) * materialInfo?.esgImpactCO2KgScrap
      );
      if (materialInfo.esgImpactCO2KgPart) {
        esgImpactCO2KgPart = this.shareService.checkDirtyProperty('co2KgPart', fieldColorsList) ? selectedMaterialInfo?.esgImpactCO2KgPart : esgImpactCO2KgPart;
      }
      materialInfo.esgImpactCO2KgPart = esgImpactCO2KgPart;
    }

    materialInfo.esgAnnualVolumeKg = this.shareService.isValidNumber(((materialInfo?.netWeight ?? 0) / 1000) * (materialInfo?.eav ?? 0));

    materialInfo.esgAnnualKgCO2 = this.shareService.isValidNumber((materialInfo?.esgImpactCO2Kg ?? 0) * (materialInfo?.esgAnnualVolumeKg ?? 0));

    materialInfo.esgAnnualKgCO2Part = this.shareService.isValidNumber((materialInfo?.esgAnnualKgCO2 ?? 0) / (materialInfo?.eav ?? 0));

    return materialInfo;
  }
}
