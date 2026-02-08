import { MaterialInfoDto, PartInfoDto } from 'src/app/shared/models';

export interface IMaterialCalculationByCommodity {
  setCurrentPart(part: PartInfoDto): void;
  CalculateMaterialCost(processId: number, materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterial: MaterialInfoDto, processMachines?: any): MaterialInfoDto;
}
