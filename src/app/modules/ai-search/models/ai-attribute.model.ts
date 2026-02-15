import { CotsInfoDto, MaterialInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';
import { CostToolingDto } from 'src/app/shared/models/tooling.model';

export interface AiAttributeModel {
  materialInfos: MaterialInfoDto[];
  processInfos: ProcessInfoDto[];
  costTooling: CostToolingDto[];
  secondaryProcesses: SecondaryProcessDto[];
  cotsInfos: CotsInfoDto[];
}
