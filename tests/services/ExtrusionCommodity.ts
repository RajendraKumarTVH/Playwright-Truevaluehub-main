import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';

import { PrimaryProcessType } from '../costing.config';
import { PlasticRubberCalculatorService } from './plastic-rubber-material';
import { MaterialMatalFormingCalculationService } from './material-hot-forging-closed-die-hot-calculator';

export class ExtrusionCommodityService implements IMaterialCalculationByCommodity {
  currentPart: PartInfoDto;

  constructor(
    private _plasticRUbberService: PlasticRubberCalculatorService,
    private _materialHotForgingClosedDieHotCalcService: MaterialMatalFormingCalculationService
  ) { }
  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }

  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      case PrimaryProcessType.RubberExtrusion:
        return this._plasticRUbberService.calculationsForRubberExtrusion(materialInfo, fieldColorsList, selectedMaterial);
      case PrimaryProcessType.MetalTubeExtrusion:
        return this._materialHotForgingClosedDieHotCalcService.calculationsForMetalTubeExtrusion(materialInfo, fieldColorsList, selectedMaterial);
      default:
        return materialInfo;
    }
  }
}
