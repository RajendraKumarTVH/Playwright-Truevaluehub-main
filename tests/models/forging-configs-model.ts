export class ForginComplexityDto {
  wt?: number;
  hf?: number;
  h1?: number;
  simpleb?: number;
  cmplexb?: number;
  wt1?: number;
  simpleb1?: number;
  complexb1?: number;
  id: number;
}

export class ForgingProcessCycleTimeDto {
  id?: number;
  processCycleTime: number;
  cuttingArea?: number;
  crossSectionArea?: number;
}

export class ForgingShapeFactorDto {
  id?: number;
  workPieceDescription: string;
  shapeFactor: number;
}

export class ForgingThreadDesignationDetails {
  id: number;
  description: string;
  pitch?: number;
  majorDiaMax?: number;
  majorDiaMin?: number;
  pitchDiaMax?: number;
  pitchDiaMin?: number;
  minorDiaMax?: number;
  minorDiaMin?: number;
  wpr600?: number;
  wpr800?: number;
  wpr1000?: number;
  wpr1200?: number;
  rf600?: number;
  rf800?: number;
  rf1000?: number;
  rf1200?: number;
  feeding10?: number;
  feeding20?: number;
  feeding30?: number;
  feeding40?: number;
  feeding50?: number;
  feeding75?: number;
  feeding100?: number;
}
