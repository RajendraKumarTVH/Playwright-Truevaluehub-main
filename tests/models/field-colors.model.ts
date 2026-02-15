export class FieldColorsDto {
  id: number;
  partInfoId?: number;
  screenId?: number;
  primaryId?: number;
  isTouched: boolean = false;
  isDirty: boolean = false;
  formControlName: string;
  subProcessInfoId?: number;
  subProcessIndex?: number;
}
