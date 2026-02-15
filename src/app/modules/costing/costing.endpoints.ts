export const costingEndpoints = {
  downloadDocument: (base: string, documentRecordId: number) => `${base}/costing/partinfo/documentrecords/${documentRecordId}/download`,
};
