export const reportsEndpoints = {
  getPartDetails: (base: string, partId: string) => `${base}/costing/Reports/GetPartDetailsById?partid=${partId}`,
  getListOfPartNo: (base: string) => `${base}/costing/Reports/GetListOfPartNo`,
  getCostBreakDownPieReportById: (base: string, partId: string) => `${base}/Reports/GetCostBreakDownPieReportById?partid=${partId}`,
  getCostBreakDownBarReportById: (base: string, partId: string) => `${base}/costing/Reports/GetCostBreakDownBarReportById?partid=${partId}`,
};
