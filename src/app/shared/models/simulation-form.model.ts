import { CountryDataMasterDto } from './country-data-master.model';
import { ProjectInfoDto } from './project-info.model';

export interface SimulationForm {
  project: ProjectInfoDto;
  part: SimulationFormPart;
  countries: CountryDataMasterDto[];
  selectAll: boolean;
  processes: number[];
}

export interface SimulationFormPart {
  projectInfoId: number;
  setValue: boolean;
  partId: number;
}
