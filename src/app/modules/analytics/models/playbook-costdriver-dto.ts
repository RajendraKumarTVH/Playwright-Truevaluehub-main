export class PlayBookCostDriverDto {
  costDriverID?: number;
  playBookId?: number;
  costDriverMasterID: number;
  newCost: number;
  slidePer: number;
  comment: string;
  currentCost: number;
  shouldCost: number;
  constructor(values?: Partial<PlayBookCostDriverDto>) {
    Object.assign(this, values);
  }
}
