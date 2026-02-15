import { PartInfoDto } from './part-info.model';

export class DocumentConversion {
  documentConversionId: number;
  partInfoId: number;
  documentRecordId?: number;
  convertedData?: string;
  viewName?: string;
  unfoldedConvertedData?: string;
  thumbnailImage?: string;
  partInfo?: PartInfoDto;
}
