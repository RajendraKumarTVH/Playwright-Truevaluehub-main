import { DocumentConversion } from './document-conversion.model';

export class BomTreeModel {
  projectInfoId: number;
  partInfoId: number;
  bomId: number;
  intPartNumber: string;
  intPartDescription: string;
  partQty: number;
  isArchived: boolean;
  isPartMoved: boolean;
  uom?: string;
  level: number;
  children: BomTreeModel[];
  name: string;
  scenarioId: number;
  dataCompletionPercentage: number;
  documentConversion?: DocumentConversion[];
}

export class BomList {
  id: string;
  parent: string;
  text: string;
  partInfoId: number;
  bomId: number;
  type: string;
  partQty: number;
  projectInfoId: number;
  state: TreeState;
  attr: TreeAttribute;
  isArchived: boolean;
  isPartMoved: boolean;
}

export class TreeState {
  opened: boolean = true;
  selected: boolean;
  percentage: number;
}

export class TreeAttribute {
  title: string;
}
