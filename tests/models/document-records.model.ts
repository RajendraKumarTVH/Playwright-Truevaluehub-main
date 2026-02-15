export class DocumentRecordDto {
  documentRecordId: number;
  documentCollectionId: number;
  docName: string;
  docLength: number;
  docLocation: string;
  docFolder: string;
  contentType: string;
  isPrivate?: boolean;
  deleted: boolean;
  tenantId: number;
  docImageLocation?: string;
  imageJson?: string;
  isSupportingDoc?: boolean;
}
