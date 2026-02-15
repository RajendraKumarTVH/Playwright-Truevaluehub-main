import { ProjectStatus } from '../enums/project-status.enum';
export class OverviewDto {
  noOfProjects: number;
  annualSpend: number;
  savingsIdentified: number;
  projectStatusId: ProjectStatus;
}
