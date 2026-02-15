import { LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';

export enum LogisticsSummaryActionTypes {
  getContainerSize = '[GetContainerSize] Get',
  getDefaultModeOfTransport = '[GetDefaultModeOfTransport] Get',
  saveSummaryInfo = '[SaveSummaryInfo] Post',
  getLogisticsSummaryByPartId = '[GetLogisticsSummaryByPartId] Get',
  deleteLogisticInfo = '[DeleteLogisticInfo] Delete',
}

export class GetContainerSize {
  static readonly type = LogisticsSummaryActionTypes.getContainerSize;
}

export class GetDefaultModeOfTransport {
  static readonly type = LogisticsSummaryActionTypes.getDefaultModeOfTransport;
  constructor(
    public mfrCountryId: number,
    public deliveryCountryId: number
  ) {}
}

export class GetLogisticsSummaryByPartId {
  static readonly type = LogisticsSummaryActionTypes.getLogisticsSummaryByPartId;
  constructor(public partInfoId: number) {}
}

export class SaveSummaryInfo {
  static readonly type = LogisticsSummaryActionTypes.saveSummaryInfo;
  constructor(public logisticsInfo: LogisticsSummaryDto) {}
}
export class DeleteLogisticInfo {
  static readonly type = LogisticsSummaryActionTypes.deleteLogisticInfo;
  constructor(public partInfoId: number) {}
}

export type LogisticsSummaryActions = GetContainerSize | GetDefaultModeOfTransport | GetLogisticsSummaryByPartId | SaveSummaryInfo | DeleteLogisticInfo;
