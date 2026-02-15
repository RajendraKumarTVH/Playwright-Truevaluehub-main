import { PageEnum } from 'src/app/shared/enums';
import { ListSimulationTotalCostDto } from '../analytics/models/simulationTotalCostDto.model';

export enum SimulationActionTypes {
  // getPreviousSimulationResult = '[GetPreviousSimulationResult] Get',
  updateSimulationResultStore = '[UpdateSimulationResultStore] Put',
  saveSimulationResultDb = '[SaveSimulationResultDb] Put',
  getSimulationResultDb = '[GetSimulationResultDb] Get',
}

// export class GetPreviousSimulationResult {
//     static readonly type = SimulationActionTypes.getPreviousSimulationResult;
//     constructor(public page: PageEnum = PageEnum.BestRegion) { }
// }

export class SaveSimulationResultDb {
  static readonly type = SimulationActionTypes.saveSimulationResultDb;
  constructor(
    public simulationdto: ListSimulationTotalCostDto,
    public page: PageEnum = PageEnum.BestRegion
  ) {}
}

export class GetSimulationResultDb {
  static readonly type = SimulationActionTypes.getSimulationResultDb;
  constructor(
    public partInfoId: number,
    public page: PageEnum = PageEnum.BestRegion
  ) {}
}

export class UpdateSimulationResultStore {
  static readonly type = SimulationActionTypes.updateSimulationResultStore;
  constructor(
    public simulationdto: ListSimulationTotalCostDto,
    public page: PageEnum = PageEnum.BestRegion
  ) {}
}

export type SimulationDataActions =
  // | GetPreviousSimulationResult
  UpdateSimulationResultStore | SaveSimulationResultDb | GetSimulationResultDb;
