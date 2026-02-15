export class BomUploadPartViewModel {
  level: string;
  partNumber: string;
  partDescription: string;
  unitofMeasure: string;
  partQty: string;
  partId: string;
  status: boolean;
  fileList: FileInfo[] = [];
  isEdit: boolean;
  id: number;
  commodityId: number;
  projectId: string;
  partRevision: string;
  annualVolume: number;
  vendorId?: number;
  mfrCountryId?: number;
  buId?: number;
  deliveryCountryId?: number;
}

export class FileInfo {
  documentId: number;
  documentName: string;
  isSupportingDocument: boolean;
}
