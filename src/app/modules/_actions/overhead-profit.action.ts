import { CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';

export enum OverHeadProfitActionTypes {
  getMedbFgiccData = '[getMedbFgiccData] Get',
  getMedbIccData = '[getMedbIccData] Get',
  getMedbOverHeadProfitData = '[getMedbOverHeadProfitData] Get',
  getMedbPaymentData = '[getMedbPaymentData] Get',
  getOverHeadProfitByPartInfoId = '[GetOverHeadProfitByPartInfoId] Get',
  createOverHeadProfit = '[CreateOverHeadProfit] Post',
  updateOverHeadProfit = '[UpdateOverHeadProfit] Put',
  getViewCostSummaryByPartInfoId = '[GetViewCostSummaryByPartInfoId] Get',
  setBulkOverheadUpdateLoading = '[SetBulkOverheadUpdateLoading] Put',
}

export class GetMedbFgiccData {
  static readonly type = OverHeadProfitActionTypes.getMedbFgiccData;
}

export class GetMedbIccData {
  static readonly type = OverHeadProfitActionTypes.getMedbIccData;
}

export class GetMedbOverHeadProfitData {
  static readonly type = OverHeadProfitActionTypes.getMedbOverHeadProfitData;
}

export class GetMedbPaymentData {
  static readonly type = OverHeadProfitActionTypes.getMedbPaymentData;
}

export class GetOverHeadProfitByPartInfoId {
  static readonly type = OverHeadProfitActionTypes.getOverHeadProfitByPartInfoId;
  constructor(public partInfoId: number) {}
}

export class CreateOverHeadProfit {
  static readonly type = OverHeadProfitActionTypes.createOverHeadProfit;
  constructor(public overHeadProfit: CostOverHeadProfitDto) {}
}

export class UpdateOverHeadProfit {
  static readonly type = OverHeadProfitActionTypes.updateOverHeadProfit;
  constructor(public overHeadProfit: CostOverHeadProfitDto) {}
}

export class GetViewCostSummaryByPartInfoId {
  static readonly type = OverHeadProfitActionTypes.getViewCostSummaryByPartInfoId;
  constructor(public partInfoId: number) {}
}

export class SetBulkOverheadUpdateLoading {
  static readonly type = OverHeadProfitActionTypes.setBulkOverheadUpdateLoading;
  constructor(public source: boolean) {}
}

export type OverHeadProfitActions =
  | GetMedbFgiccData
  | GetMedbIccData
  | GetMedbOverHeadProfitData
  | GetMedbPaymentData
  | GetOverHeadProfitByPartInfoId
  | CreateOverHeadProfit
  | UpdateOverHeadProfit
  | GetViewCostSummaryByPartInfoId
  | SetBulkOverheadUpdateLoading;
