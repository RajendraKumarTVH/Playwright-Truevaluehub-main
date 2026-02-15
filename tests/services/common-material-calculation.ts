import { SharedService } from './shared';
import { MaterialInfoDto } from 'src/app/shared/models';
export class CommonMaterialCalculationService {
  constructor(private shareService: SharedService) { }

  public setDirtyChecksForCommonFields(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, processFlag?: any) {
    if (materialInfo.isDensityDirty && materialInfo.density != null) {
      materialInfo.density = Number(materialInfo.density);
    } else {
      materialInfo.density = this.shareService.checkDirtyProperty('density', fieldColorsList) ? selectedMaterial?.density : materialInfo.density;
    }
    if (materialInfo.isAvgWallthickDirty && materialInfo.wallAverageThickness != null) {
      materialInfo.wallAverageThickness = Number(materialInfo.wallAverageThickness);
    } else {
      materialInfo.wallAverageThickness = this.shareService.checkDirtyProperty('wallAverageThickness', fieldColorsList) ? selectedMaterial?.wallAverageThickness : materialInfo.wallAverageThickness;
    }
    if (materialInfo.isStdDeviationDirty && materialInfo.standardDeviation != null) {
      materialInfo.standardDeviation = Number(materialInfo.standardDeviation);
    } else {
      materialInfo.standardDeviation = this.shareService.checkDirtyProperty('standardDeviation', fieldColorsList) ? selectedMaterial?.standardDeviation : materialInfo.standardDeviation;
    }
    if (materialInfo.isScrapPriceDirty && materialInfo.scrapPricePerKg != null) {
      materialInfo.scrapPricePerKg = Number(materialInfo.scrapPricePerKg);
    } else {
      materialInfo.scrapPricePerKg = this.shareService.checkDirtyProperty('scrapPrice', fieldColorsList) ? selectedMaterial?.scrapPricePerKg : materialInfo.scrapPricePerKg;
    }
    if (materialInfo.isPartVolumeDirty && materialInfo?.partVolume != null) {
      materialInfo.partVolume = Number(materialInfo?.partVolume);
    } else {
      if (materialInfo?.partVolume != null) {
        materialInfo.partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList) ? selectedMaterial.partVolume : materialInfo.partVolume;
      }
    }
    if (materialInfo.isNetweightDirty && materialInfo.netWeight != null) {
      materialInfo.netWeight = Number(materialInfo.netWeight);
    } else {
      let netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
      if (materialInfo.netWeight != null) {
        netWeight = this.shareService.checkDirtyProperty('netWeight', fieldColorsList) ? selectedMaterial?.netWeight : netWeight;
      }
      materialInfo.netWeight = netWeight;
    }
    if (materialInfo.isPartProjectedAreaDirty && materialInfo.partProjectedArea !== null) {
      materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
    } else {
      let area = materialInfo.dimArea;
      if (processFlag.IsProcessTypeInjectionMolding || processFlag.IsProcessTypeRubberInjectionMolding) {
        area = materialInfo.projectedArea;
      } else if (processFlag.IsProcessHPDCCasting || processFlag.IsProcessTypeWireCuttingTermination || processFlag.IsProcessLPDCCasting) {
        area = materialInfo?.partSurfaceArea;
      }

      if (materialInfo.partProjectedArea !== null) {
        area = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList) ? selectedMaterial?.partProjectedArea : Number(materialInfo.partProjectedArea);
      }
      materialInfo.partProjectedArea = area;
    }

    if (materialInfo.isPartSurfaceAreaDirty && materialInfo.partSurfaceArea != null) {
      materialInfo.partSurfaceArea = Number(materialInfo.partSurfaceArea);
    } else {
      materialInfo.partSurfaceArea = this.shareService.checkDirtyProperty('partSurfaceArea', fieldColorsList) ? selectedMaterial?.partSurfaceArea : materialInfo.partSurfaceArea;
    }

    if (materialInfo?.isEsgImpactCO2KgDirty && materialInfo.esgImpactCO2Kg != null) {
      materialInfo.esgImpactCO2Kg = Number(materialInfo?.esgImpactCO2Kg);
    } else {
      materialInfo.esgImpactCO2Kg = this.shareService.checkDirtyProperty('esgImpactCO2Kg', fieldColorsList)
        ? selectedMaterial?.esgImpactCO2Kg
        : this.shareService.isValidNumber(Number(materialInfo.esgImpactCO2Kg));
    }
    materialInfo.totalEsgImpactCO2Kg = this.shareService.isValidNumber((Number(materialInfo.esgImpactCO2Kg) * Number(materialInfo.netWeight)) / 1000);
    return materialInfo;
  }
}
