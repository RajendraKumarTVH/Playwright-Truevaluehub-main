import { Component, Input, ChangeDetectionStrategy, signal, ChangeDetectorRef, linkedSignal, effect, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AiSearchService, BlockUiService, BomService } from 'src/app/shared/services';
import { BomTreeModel } from 'src/app/shared/models/bom-tree-viewmodel';
import { ViewCostSummaryDto } from 'src/app/shared/models/cost-summary.model';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ProgressBarComponent } from 'src/app/shared/components';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { AiSearchTileExtractionInfoDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentConversion } from 'src/app/shared/models/document-conversion.model';
import { Column, CostGraphicalData } from '../../interfaces/column.tree.interface';
import { BomCostSummaryDto } from 'src/app/shared/models/bom-cost-summary-dto';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-bom-cost-summary',
  imports: [CommonModule, TreeTableModule, ProgressBarComponent, NgCircleProgressModule, MatIconModule, MatTooltipModule],
  standalone: true,
  templateUrl: './bom-cost-summary.component.html',
  styleUrl: './bom-cost-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BomCostSummaryComponent {
  frozenCols: Column[] = [{ field: 'name', header: 'Part' }];
  scrollableCols: Column[] = [];
  private readonly allScrollableCols: Column[] = [
    { field: 'thumbnailImage', header: 'Image', cssClass: 'thumbnail-col' },
    { field: 'dataCompletionPercentage', header: '% Completion', cssClass: 'completion-col' },
    { field: 'partQty', header: 'BOM Qty (Nos.)', cssClass: 'bom-qty-col' },
    { field: 'graphical', header: 'Graphical', cssClass: 'graphical-col' },
    { field: 'sumNetMatCost', header: 'Material Cost ($)' },
    { field: 'sumManufacturingCost', header: 'Manufact. Cost ($)' },
    { field: 'toolingCost', header: 'Tooling Cost ($)' },
    { field: 'sumOverHeadCost', header: 'Overhead & Profit Cost ($)' },
    { field: 'packingCost', header: 'Packing Cost ($)' },
    { field: 'eXWPartCostAmount', header: 'Ex-W Cost ($)', cssClass: 'highlighted-col !font-semibold' },
    { field: 'freightCost', header: 'Freight Cost ($)' },
    { field: 'dutiesTariffCost', header: 'Duties & Tariff Cost ($)' },
    { field: 'shouldCost', header: 'Should Cost ($)', cssClass: 'highlighted-col w-40 !font-semibold' },
    { field: 'currMaterialCost', header: 'Current Cost ($)' },
  ];

  public readonly costChartData: CostGraphicalData[] = [
    { id: 1, label: 'Material Cost', percent: 25, color: '#89D6FB', offset: 0 },
    { id: 2, label: 'Mfg. Cost', percent: 25, color: '#A1B5FF', offset: 0 },
    { id: 3, label: 'Tooling Cost', percent: 10, color: '#FFA987', offset: 0 },
    { id: 4, label: 'Overhead & Profit', percent: 5, color: '#D3BFF3', offset: 0 },
    { id: 5, label: 'Packing Cost', percent: 5, color: '#7094DB', offset: 0 },
    { id: 6, label: 'Freight Cost', percent: 20, color: '#AEC6CF', offset: 0 },
    { id: 7, label: 'Duties and Tariff', percent: 10, color: '#A28CFF', offset: 0 },
  ];
  chartData: CostGraphicalData[] = [];

  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  isToggleNumeric = this.sharedService.costSummaryIsNumeric;
  currentExpandedLevel = 0;
  maxLevel = 0;
  levelOffset = [];

  private _inputData: { [key: string]: any } = null;
  @Input() public set inputData(value: { [key: string]: any }) {
    if (value?.projectInfoId && value?.scenarioId) {
      this._inputData = value;
      this.setViewTreeData(value);
      this.setColomnView();
    }
  }

  private _bomTreeImages: DocumentConversion[] = [];
  @Input() set bomTreeImages(images: DocumentConversion[]) {
    // if images api completes later
    this._bomTreeImages = images ?? [];
    this.injectThumbnailsIntoTree();
  }

  private costSummary: ViewCostSummaryDto[];
  loadingS = signal<boolean>(true);
  private resultS = signal<BomCostSummaryDto | null>(null);
  treeViewDataS: WritableSignal<TreeNode[]> = linkedSignal(() => {
    const result = this.resultS();
    if (!result) return [];
    this.maxLevel = this.getTreeDepth(result.bomTreeModel ?? []);
    this.costSummary = result.viewCostSummary ?? [];
    let treeViewData = this.mapCostSummaryToBomTree(result.bomTreeModel ?? []);
    treeViewData = this.reverseIterateTreeViewData(treeViewData, 0, treeViewData[0].data.shouldCost);
    console.log('Tree View Data:', treeViewData);
    return treeViewData;
  });

  constructor(
    private modalService: NgbModal,
    private searchService: AiSearchService,
    private bomService: BomService,
    private blockUiService: BlockUiService,
    private messaging: MessagingService,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
    effect(() => {
      this.treeViewDataS();
      console.log(this.treeViewDataS());
      this.detectChanges();
    });
  }

  public changeViewType() {
    this.sharedService.costSummaryIsNumeric.set(!this.sharedService.costSummaryIsNumeric());
    this.setColomnView();
  }

  private setColomnView() {
    let scrollableCols: Column[] = [...this.allScrollableCols];
    if (this.isToggleNumeric()) {
      scrollableCols.splice(3, 1); // remove Graphical column
    } else {
      scrollableCols.splice(4, 8);
      scrollableCols.splice(5, 1);
    }
    this.scrollableCols = scrollableCols;
  }

  private getTreeDepth(tree: BomTreeModel[]): number {
    if (!tree || tree.length === 0) return 0;

    const getDepth = (nodes: BomTreeModel[]): number => {
      let max = nodes[0].level;
      for (let node of nodes) {
        if (node.children && node.children.length > 0) {
          const depth = getDepth(node.children);
          max = Math.max(max, depth);
        }
      }
      return max;
    };
    return getDepth(tree);
  }

  expandCollapseLevel(value: boolean) {
    !value && this.currentExpandedLevel--;
    const treeViewData = [...this.treeViewDataS()];
    const updateLevel = (nodes: TreeNode[]) => {
      for (let node of nodes) {
        if (value || (!value && this.currentExpandedLevel === node.data.level)) {
          node.expanded = value;
        }
        if (node.children && this.currentExpandedLevel > node.data.level) {
          updateLevel(node.children);
        }
      }
    };
    updateLevel(treeViewData);
    this.treeViewDataS.set(treeViewData);
    value && this.currentExpandedLevel++;
  }

  expCollClick(event: any, changeType: 'expand' | 'collapse') {
    if (changeType === 'expand') {
      this.currentExpandedLevel = event.node.data.level - 1;
      this.expandCollapseLevel(true);
    } else {
      this.currentExpandedLevel = event.node.data.level + 1;
      this.expandCollapseLevel(false);
    }
    this.detectChanges();
  }

  private async setViewTreeData(value: { [key: string]: any }) {
    try {
      const result = await firstValueFrom(this.bomService.getBomsTreeCostSummaryByProjectId(value.projectInfoId, value.scenarioId));
      this.resultS.set(result);
    } catch {
      this.messaging.openSnackBar('Bom Tree Summary Data Fetching Failed', '', {
        duration: 5000,
      });
      this.resultS.set(null);
    } finally {
      this.loadingS.set(false);
    }
  }

  private calculateOffsets(chartData: CostGraphicalData[]): CostGraphicalData[] {
    let offset = 0;
    for (const item of chartData) {
      // if (item.resetFlow) {
      //   item.offset = 0;
      // } else {
      item.offset = offset;
      offset += item.percent;
      // }
    }
    return chartData;
  }

  private injectThumbnailsIntoTree(): void {
    if (!this._bomTreeImages.length || !this.treeViewDataS().length) return;
    const updatedTree = this.updateThumbnailsRecursively(this.treeViewDataS(), this._bomTreeImages);
    this.treeViewDataS.set(updatedTree);
  }

  private updateThumbnailsRecursively(nodes: TreeNode[], imageList: any[]): TreeNode[] {
    return nodes.map((node) => {
      const matchedImage = imageList.find((img) => img.partInfoId === node.data.partInfoId);
      const updatedData = {
        ...node.data,
        thumbnailImage: matchedImage?.thumbnailImage ?? null,
      };

      return {
        ...node,
        data: updatedData,
        children: node.children?.length ? this.updateThumbnailsRecursively(node.children, imageList) : [],
      };
    });
  }

  mapCostSummaryToBomTree(bomTree: BomTreeModel[]): TreeNode[] {
    return bomTree.map((part: BomTreeModel) => {
      const node = structuredClone(part);
      const matchingCost = this.costSummary.find((c) => c.partInfoId === part.partInfoId);
      const eXWPartCostAmount =
        (+matchingCost?.sumNetMatCost || 0) +
        (+matchingCost?.sumManufacturingCost || 0) +
        (+matchingCost?.sumOverHeadCost || 0) +
        (+matchingCost?.toolingCost || 0) +
        (+matchingCost?.packingCost || 0);
      const shouldCost = eXWPartCostAmount + (+matchingCost?.freightCost || 0) + (+matchingCost?.dutiesTariffCost || 0);
      let thumbnailImage = null;
      if (this._inputData?.bomTreeImages.length) {
        thumbnailImage = this._inputData?.bomTreeImages.find((img) => img.partInfoId === part.partInfoId)?.thumbnailImage ?? null;
      } else if (this._bomTreeImages?.length) {
        thumbnailImage = this._bomTreeImages.find((img) => img.partInfoId === part.partInfoId)?.thumbnailImage ?? null;
      }
      let icon = 'icon-part';
      if (part.level === 0) {
        icon = 'icon-file';
      } else if (part.children.length > 0) {
        icon = 'icon-assembly';
      }

      const costChartData = structuredClone(this.costChartData);
      costChartData[0].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.sumNetMatCost / shouldCost) * 100 || 0);
      costChartData[1].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.sumManufacturingCost / shouldCost) * 100 || 0);
      costChartData[2].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.toolingCost / shouldCost) * 100 || 0);
      costChartData[3].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.sumOverHeadCost / shouldCost) * 100 || 0);
      costChartData[4].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.packingCost / shouldCost) * 100 || 0);
      costChartData[5].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.freightCost / shouldCost) * 100 || 0);
      costChartData[6].percent = +this.sharedService.transformNumberTwoDecimal((+matchingCost?.dutiesTariffCost / shouldCost) * 100 || 0);

      const children = part.children?.length ? this.mapCostSummaryToBomTree(part.children) : [];
      delete node.children;
      return {
        key: node.partInfoId.toString(),
        children,
        data: {
          ...node,
          ...matchingCost,
          eXWPartCostAmount,
          shouldCost,
          widthPercentage: 0,
          offset: 0,
          icon,
          chart: this.calculateOffsets(costChartData),
          // chart: shouldCost > 0 ? this.calculateOffsets(costChartData) : this.calculateOffsets(this.costChartData),
          thumbnailImage,
        },
      };
    });
  }

  reverseIterateTreeViewData(bomTree: TreeNode[], parentOffset: number, totalCost: number): TreeNode[] {
    for (let i = bomTree.length - 1; i >= 0; i--) {
      const node = bomTree[i];
      if (node.data.shouldCost > 0) {
        node.data.widthPercentage = (node.data.shouldCost / totalCost) * 100;

        if (i === bomTree.length - 1) {
          node.data.offset = parentOffset || 0;
        } else {
          node.data.offset = bomTree[i + 1]?.data?.offset + bomTree[i + 1]?.data?.widthPercentage || 0;
        }
      } else {
        node.data.offset = parentOffset || 0;
      }
      node.data.children = this.reverseIterateTreeViewData(node.children, node.data.offset, totalCost);
    }
    return bomTree;
  }

  detectChanges(timeout = 500) {
    setTimeout(() => this.cd.detectChanges(), timeout);
  }

  onPartThumbnailClick(partInfoId: number) {
    // let fileType = 'cad';
    this.blockUiService.pushBlockUI('open3DViewer');
    this.searchService
      .getExtractionInfo([partInfoId])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (result: AiSearchTileExtractionInfoDto[]) => {
          const item = result[0];
          // if (fileType === 'pdf') {
          //   this.blockUiService.popBlockUI('open3DViewer');
          //   return;
          // }
          const extractedData = {
            material: JSON.parse(item?.materialInfoJson),
            process: JSON.parse(item?.processInfoJson),
          };

          const fileName = item.fileName;
          const modalRef = this.modalService.open(CadViewerPopupComponent, {
            windowClass: 'fullscreen',
          });
          modalRef.componentInstance.fileName = fileName;

          modalRef.componentInstance.partData = {
            caller: 'bom-details',
            partId: partInfoId,
            volume: extractedData?.material?.DimVolume,
            surfaceArea: extractedData?.material?.DimArea,
            projectedArea: extractedData?.material?.ProjectedArea,
            dimentions: {
              dimX: extractedData?.material?.DimX,
              dimY: extractedData?.material?.DimY,
              dimZ: extractedData?.material?.DimZ,
            },
            centerMass: {
              centroidX: extractedData?.process?.CentroidX,
              centroidY: extractedData?.process?.CentroidY,
              centroidZ: extractedData?.process?.CentroidZ,
            },
          };
          this.blockUiService.popBlockUI('open3DViewer');
        },
      });
  }

  dismissAll() {
    this.modalService.dismissAll();
  }
}
