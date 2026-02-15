import { PartInfoDto } from './part-info.model';

export class ProjectScenarioDto {
  scenarioId: number;
  projectInfoId: number;
  scenarioName: string;
  scenarioDescription: string;
  isDefault: boolean;
  isDeleted: boolean;
  partInfos: PartInfoDto[] | null;
  sortOrder: number;
}

export interface ProjectPartInfoScenario {
  intPartNumber: string;
  partInfos: ProjectPartScenario[];
}

export interface ProjectPartScenario {
  scenario: Pick<ProjectScenarioDto, 'scenarioId' | 'scenarioName' | 'scenarioDescription'>;
  partInfoId: number;
  selected?: boolean;
}
