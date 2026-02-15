import { BomTreeModel } from './bom-tree-viewmodel';
import { ViewCostSummaryDto } from '../models';

export class BomCostSummaryDto {
  bomTreeModel: BomTreeModel[];
  viewCostSummary: ViewCostSummaryDto[];
}
