import { ProjectInfoDto } from './project-info.model';
import { CountryDataMasterDto } from './country-data-master.model';
import { ProcessType } from './process-type.model';
import { PartInfoDto } from './part-info.model';

export interface SimulationEmit {
  selectedProject: ProjectInfoDto;
  selectedCountries: CountryDataMasterDto[];
  selectedProcesses: ProcessType[];
  selectedPart: PartInfoDto;
}
