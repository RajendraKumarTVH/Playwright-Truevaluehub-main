
import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';
import { IMaterialCalculationByCommodity } from './IMaterialCalculationByCommodity';
export class MaterialDefaultCalculatorService implements IMaterialCalculationByCommodity {
  private currentPart?: PartInfoDto;

  setCurrentPart(part: PartInfoDto) {
    this.currentPart = part;
  }
  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto): MaterialInfoDto {
    switch (processId) {
      default:
        return materialInfo;
    }
  }
}
