// import { CotsInfoDto } from '../../shared/models';

// export enum CotsInfoActionTypes {
//   getCotsInfoByPartInfoId = '[GetCotsInfoByPartInfoId] Get',
//   createCotsInfo = '[CreateCotsInfo] Post',
//   updateCotsInfo = '[UpdateCotsInfo] Put',
//   deleteCotsInfo = '[DeleteCotsInfo] Delete',
//   bulkUpdateCotsInfo = '[BulkUpdateCotsInfo] Put',
//   moveAssembliesInfo = '[MoveAssembliesInfo] Post',
// }

// export class GetCotsInfoByPartInfoId {
//   static readonly type = CotsInfoActionTypes.getCotsInfoByPartInfoId;
//   constructor(public partinfoId: number) {}
// }

// export class CreateCotsInfo {
//   static readonly type = CotsInfoActionTypes.createCotsInfo;
//   constructor(public cotsInfo: CotsInfoDto) {}
// }

// export class UpdateCotsInfo {
//   static readonly type = CotsInfoActionTypes.updateCotsInfo;
//   constructor(public cotsInfo: CotsInfoDto) {}
// }

// export class DeleteCotsInfo {
//   static readonly type = CotsInfoActionTypes.deleteCotsInfo;
//   constructor(
//     public cotsInfoId: number,
//     public partInfoId: number
//   ) {}
// }

// export class BulkUpdateCotsInfo {
//   static readonly type = CotsInfoActionTypes.bulkUpdateCotsInfo;
//   constructor(public cotsInfo: CotsInfoDto[]) {}
// }

// export class MoveAssembliesInfo {
//   static readonly type = CotsInfoActionTypes.moveAssembliesInfo;
//   constructor(
//     public bomIds: number[],
//     public action: string,
//     public projectId: number,
//     public scenarioId: number,
//     public partInfoId: number
//   ) {}
// }

// export type CotsInfoAction = GetCotsInfoByPartInfoId | CreateCotsInfo | UpdateCotsInfo | DeleteCotsInfo | BulkUpdateCotsInfo | MoveAssembliesInfo;
