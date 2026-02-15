export class PartDetailsByProjectDto {
  projectInfoId: number;
  partInfoId: number;
  scenarioId: number;
  projectStatusId?: number;
  bomId?: number;
  intPartNumber?: string;
  documentCollectionId?: number;
  documentRecordId?: number;
  docName?: string;
  dataExtractionStatus?: number;
  dataExtractionPercentage?: number;
  reasonForFailure?: string;
  totalAverage?: number;
  partExtractionStatus?: string;
  partRevision?: string;
  dataExtractionTimeRemaining?: string;
}
