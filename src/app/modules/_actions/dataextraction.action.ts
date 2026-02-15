export enum DataExtractionActionTypes {
  getExtractDataByPartInfoId = '[GetExtractDataByPartInfoId] Get',
}

export class GetExtractDataByPartInfoId {
  static readonly type = DataExtractionActionTypes.getExtractDataByPartInfoId;
  constructor(public partInfoId: number) {}
}

export type DataExtractionActions = GetExtractDataByPartInfoId;
