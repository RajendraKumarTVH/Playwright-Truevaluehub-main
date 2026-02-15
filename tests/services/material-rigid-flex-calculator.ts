
import { MaterialInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
export class MaterialRigidFlexCalculationService {
  constructor(private shareService: SharedService) { }

  public calculationsForRigidFlex(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): MaterialInfoDto {
    if (materialInfo.isTypeOfCableDirty && !!materialInfo.typeOfCable) {
      materialInfo.typeOfCable = Number(materialInfo.typeOfCable);
    } else {
      materialInfo.typeOfCable = this.shareService.checkDirtyProperty('typeOfCable', fieldColorsList) ? selectedMaterialInfo?.typeOfCable : Number(materialInfo.typeOfCable);
    }
    return materialInfo;
  }
}
