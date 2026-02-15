import { DocumentRecordDto } from './document-records.model';

export class DocumentCollectionDto {
  documentCollectionId: number;
  collectionName: string;
  deleted: string;
  tenantId: string;
  documentRecords: DocumentRecordDto[] = [];
}
