import { DfActionEnum } from './df-action-enum';
import { DfMachineInfoDto } from './df-machine-info-dto';
import { DfMaterialInfoDto } from './df-material-info-dto';

export interface DfActionDto {
  actionType: DfActionEnum;
  actionData?: DfMaterialInfoDto | DfMachineInfoDto;
}
