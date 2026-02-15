// import { CopyScenarioDto } from 'src/app/shared/models/copy-scenario.model';

// export enum ScenarioActionTypes {
//   getAllActiveScenarioByProjectId = '[GetAllActiveScenarioByProjectId] Get',
//   getAllPartScenarioByProjectId = '[GetAllPartScenarioByProjectId] Get',
//   copyScenario = '[CopyScenario] Post',
//   removeScenario = '[RemoveScenario] Post',
//   clear = '[ClearScenarioInfos] Clear',
// }

// export class GetAllActiveScenarioByProjectId {
//   static readonly type = ScenarioActionTypes.getAllActiveScenarioByProjectId;
//   constructor(public projectInfoId: number) {}
// }

// export class GetAllPartScenarioByProjectId {
//   static readonly type = ScenarioActionTypes.getAllPartScenarioByProjectId;
//   constructor(public projectInfoId: number) {}
// }

// export class CopyScenario {
//   static readonly type = ScenarioActionTypes.copyScenario;
//   constructor(public copyScenarioDto: CopyScenarioDto) {}
// }

// export class RemoveScenario {
//   static readonly type = ScenarioActionTypes.removeScenario;
//   constructor(
//     public projectId: number,
//     public scenarioId: number
//   ) {}
// }

// export class ClearScenarioInfos {
//   static readonly type = ScenarioActionTypes.clear;
// }

// export type ScenarioAction = GetAllActiveScenarioByProjectId | GetAllPartScenarioByProjectId | CopyScenario | RemoveScenario | ClearScenarioInfos;
