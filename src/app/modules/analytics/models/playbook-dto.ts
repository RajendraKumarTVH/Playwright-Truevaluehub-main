import { PlayBookCostDriverDto } from './playbook-costdriver-dto';

export class PlaybookDto {
  playBookId: number;
  playbookName?: string;
  projectInfoId?: number;
  partInfoId?: number;
  supplierId?: number;
  revisionLevel?: number;
  playBookCostDriver: PlayBookCostDriverDto[];
  constructor(values?: Partial<PlaybookDto>) {
    Object.assign(this, values);
  }
}
