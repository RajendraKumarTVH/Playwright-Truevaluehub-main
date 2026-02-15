import { SimulationTotalCostDto } from './simulationTotalCostDto.model';

export interface BestRegionAnalyticsDto {
  bestRegionAnalyticsId?: number;
  projectInfoId: number;
  partInfoId: number;
  scenarioId: number;
  analysisName: string;
  simulationTotalCostDto: SimulationTotalCostDto[];
  isDeleted?: boolean;
  createDate?: string;
  modifiedDate?: string;
  createdUserId?: number;
  modifiedUserId?: number;
  // Extra fields from backend for UI display
  projectName?: string;
  scenarioName?: string;
  partName?: string;
  partInfoName?: string; // backend may send PartInfoName
  partModel?: string;
  createdBy?: string;
}

export interface ListBestRegionAnalyticsDto {
  BestRegionAnalyticsDtos: BestRegionAnalyticsDto[];
}
