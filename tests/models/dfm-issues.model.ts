export interface DFMSheetMetalAnalyzer {
  totalIssues: number;
  dfmSheetMetalAnalyzerInfos: DFMSheetMetalAnalyzerInfo[] | null;
}

export interface DFMSheetMetalAnalyzerInfo {
  issueKey: string;
  totalIssues: number;
  expectedValue: DFMSheetMetalAnalyzerExpectedValue[] | null;
}

export interface DFMSheetMetalAnalyzerExpectedValue {
  key: string;
  value: string;
  actualValue: DFMSheetMetalAnalyzerActualValue[] | null;
}

export interface DFMSheetMetalAnalyzerActualValue {
  key: string;
  value: string;
}
