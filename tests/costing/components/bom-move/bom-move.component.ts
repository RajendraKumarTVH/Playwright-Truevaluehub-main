import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxModule } from 'primeng/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DocumentConversion } from 'src/app/shared/models/document-conversion.model';
import { BomTreeModel } from 'src/app/shared/models/bom-tree-viewmodel';
import { ProgressBarComponent } from 'src/app/shared/components';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
// import * as CotsInfoAction from 'src/app/modules/_actions/cots-info.action';
import { Store } from '@ngxs/store';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
import { Column } from 'src/app/modules/costing/interfaces/column.tree.interface';
import { PartThumbnailHelperService } from 'src/app/shared/helpers/part-thumbnail-helper.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { CotsInfoSignalsService } from 'src/app/shared/signals/cots-info-signals.service';

@Component({
  selector: 'app-bom-move',
  imports: [CommonModule, TreeTableModule, CheckboxModule, FormsModule, ProgressBarComponent, MatIconModule],
  standalone: true,
  templateUrl: './bom-move.component.html',
  styleUrl: './bom-move.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BomMoveComponent {
  private _inputData: { [key: string]: any } = null;
  selectedPartInfoId: number;

  @Input() public set inputData(value: { [key: string]: any }) {
    if (value?.bomTree) {
      this.selectedPartInfoId = value?.selectedPartInfoId || value?.bomTree?.[0]?.partInfoId;
      this._inputData = value;
      this.treeViewData = this.mapCostSummaryToBomTree(this._inputData.bomTree) ?? [];
      this.expandAll();
      this.selectionKeys = this.generateSelectionKeysFromTree(this.treeViewData);
    }
  }
  cols: Column[] = [
    { field: 'name', header: 'Part' },
    { field: 'thumbnailImage', header: 'Image', cssClass: 'thumb-col' },
  ];
  private _bomTreeImages: DocumentConversion[] = [];
  @Input() set bomTreeImages(images: DocumentConversion[]) {
    // if images api completes later
    this._bomTreeImages = images ?? [];
    this.injectThumbnailsIntoTree();
  }
  @ViewChild('tt') tt!: TreeTable;
  @Output() outputData: EventEmitter<any> = new EventEmitter();
  selectedPartisMoved: boolean;
  globalFilter: string = '';
  isAnyMoveDone: boolean = false;
  treeViewData!: TreeNode[];
  selectionKeys = {};
  // isMoveDisabled: boolean = true;
  constructor(
    private modalService: NgbModal,
    private messaging: MessagingService,
    private _store: Store,
    private cdr: ChangeDetectorRef,
    private partThumbnailHelperService: PartThumbnailHelperService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private cotsInfoSignalsService: CotsInfoSignalsService
  ) {}

  private expandAll() {
    this.treeViewData.forEach((node) => this.expandRecursive(node, true));
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((child) => this.expandRecursive(child, isExpand));
    }
  }

  // onSearchChange(value: string) {
  //   this.tt.filterGlobal(value, 'contains');
  //   const selectedKeys = Object.keys(this.selectionKeys).filter((k) => this.selectionKeys[k].checked);

  //   const collectKeys = (nodes: any[]): string[] => {
  //     let keys: string[] = [];
  //     for (let n of nodes) {
  //       keys.push(n.key);
  //       if (n.children?.length) {
  //         keys = keys.concat(collectKeys(n.children));
  //       }
  //     }
  //     return keys;
  //   };

  //   const visibleKeys = collectKeys(this.tt.filteredNodes || []);
  //   this.isMoveDisabled = !selectedKeys.some((k) => visibleKeys.includes(k));
  //   this.cdr.detectChanges();
  // }
  get isMoveDisabled() {
    return !Object.values(this.selectionKeys || {}).some((sel: any) => sel.checked);
  }

  onToggleClick(event: MouseEvent) {
    (event.target as HTMLElement).blur();
  }

  private generateSelectionKeysFromTree(tree: TreeNode[]) {
    const keys: { [key: string]: { checked: boolean } } = {};
    // const keys: { [key: string]: { checked: boolean; disabled: boolean } } = {};
    const traverse = (nodes: TreeNode[], parentIsPartMoved: boolean = false) => {
      for (const node of nodes) {
        const isDisabled = parentIsPartMoved;
        keys[node.key] = {
          // checked: false,
          checked: isDisabled ? null : false,
          // disabled: isDisabled,
        };
        if (node.children?.length > 0) {
          traverse(node.children, node.data?.isPartMoved || isDisabled);
        }
      }
    };

    traverse(tree);
    return keys;
  }

  onMove() {
    // const bomIds = Object.keys(this.selectionKeys).filter((key) => this.selectionKeys[key].checked);
    const bomIds = this.getSelectedBomIds();
    if (bomIds.length === 0) return;
    const selectedNodes = this.getNodesByKeys(bomIds, this.treeViewData);
    this.selectedPartisMoved = selectedNodes[0].data?.isPartMoved;

    // if (bomIds.length > 0) {
    // let childNodes: TreeNode[] = [];
    // let deleteMsg = '';

    // if (!this.selectedPartisMoved) {
    //   selectedNodes.forEach((node) => {
    //     childNodes = [...childNodes, ...this.getChildNodes(node)];
    //   });
    //   const hasChildWithPartMoved = (nodes: any[]): boolean => {
    //     for (const node of nodes) {
    //       if (childNodes.some((c) => c.data.id === node.data.id) && node.data.isPartMoved) {
    //         return true;
    //       }
    //       if (node.children?.length && hasChildWithPartMoved(node.children)) {
    //         return true;
    //       }
    //     }
    //     return false;
    //   };

    //   if (hasChildWithPartMoved(this.treeViewData)) {
    //     deleteMsg = '<div class="cancel-icon mt-3 text-xs">Note: All existing child parts of the selected items will be removed from the Purchase Parts Catalogue.</div>';
    //   }
    // }
    const deleteMsg = this.getDeleteMessage(selectedNodes);

    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: this.selectedPartisMoved ? 'Confirm Moving Part(s) Back to Manufactured Parts' : 'Confirm Moving to Purchase Parts Catalogue',
        message: 'Confirm Moving the Purchase Part by selecting CONFIRM, or cancel this action by selecting CANCEL.' + deleteMsg,
        action: 'Confirm',
        cancelText: 'Cancel',
      },
      panelClass: 'confirm-modal',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.executeMoveAction(bomIds, selectedNodes);
      // let movedChildren: TreeNode[] = [];
      // selectedNodes.forEach((node) => {
      //   movedChildren = [...movedChildren, ...this.getChildNodes(node)];
      // });

      // const bomIdsNumber = bomIds.map((id) => Number(id));
      // const updateIsPartMoved = (nodes: any[], value: boolean) => {
      //   nodes.forEach((node) => {
      //     if (bomIds.includes(node.key) || movedChildren.some((c) => c.key === node.key)) {
      //       node.data.isPartMoved = value;
      //     }
      //     if (node.children?.length) {
      //       updateIsPartMoved(node.children, value);
      //     }
      //   });
      // };
      // if (this.selectedPartisMoved) {
      //   this._store.dispatch(new CotsInfoAction.MoveAssembliesInfo(bomIdsNumber, 'toBom', this._inputData?.projectInfoId, this._inputData?.scenarioId, +this.selectedPartInfoId));
      //   updateIsPartMoved(this.treeViewData, false);
      // } else {
      //   this._store.dispatch(new CotsInfoAction.MoveAssembliesInfo(bomIdsNumber, 'toCatalogue', this._inputData?.projectInfoId, this._inputData?.scenarioId, +this.selectedPartInfoId));
      //   updateIsPartMoved(this.treeViewData, true);
      // }
      // //uncheck the checked nodes
      // Object.keys(this.selectionKeys).forEach((key) => {
      //   if (this.selectionKeys[key]) {
      //     this.selectionKeys[key].checked = false;
      //   }
      // });
      // //enable all
      // this.disableOppositeNodes(this.treeViewData, null);
      // this.cdr.detectChanges();
      // this.isAnyMoveDone = true;
    });
    // }
  }

  private getSelectedBomIds(): string[] {
    return Object.keys(this.selectionKeys).filter((key) => this.selectionKeys[key]?.checked);
  }

  private getDeleteMessage(selectedNodes: TreeNode[]): string {
    if (this.selectedPartisMoved) return '';

    const childNodes = selectedNodes.flatMap((node) => this.getChildNodes(node));
    const hasMovedChild = this.hasChildWithPartMoved(this.treeViewData, childNodes);
    return hasMovedChild ? '<div class="cancel-icon mt-3 text-xs">Note: All existing child parts of the selected items will be removed from the Purchase Parts Catalogue.</div>' : '';
  }

  private hasChildWithPartMoved(nodes: any[], childNodes: any[]): boolean {
    return nodes.some((node) => {
      const isMovedChild = childNodes.some((c) => c.data.id === node.data.id && node.data.isPartMoved);
      return isMovedChild || (node.children?.length && this.hasChildWithPartMoved(node.children, childNodes));
    });
  }

  private executeMoveAction(bomIds: string[], selectedNodes: TreeNode[]) {
    // let movedChildren: TreeNode[] = [];
    // selectedNodes.forEach((node) => {
    //   movedChildren = [...movedChildren, ...this.getChildNodes(node)];
    // });
    const movedChildren = selectedNodes.flatMap((node) => this.getChildNodes(node));
    // const moveToCatalogue = !this.selectedPartisMoved;
    const moveType = !this.selectedPartisMoved ? 'toCatalogue' : 'toBom';
    // const isPartMovedValue = moveToCatalogue;

    const bomIdsNumber = bomIds.map(Number);
    // const updateIsPartMoved = (nodes: any[], value: boolean) => {
    //   nodes.forEach((node) => {
    //     if (bomIds.includes(node.key) || movedChildren.some((c) => c.key === node.key)) {
    //       node.data.isPartMoved = value;
    //     }
    //     if (node.children?.length) {
    //       updateIsPartMoved(node.children, value);
    //     }
    //   });
    // };
    // if (this.selectedPartisMoved) {
    this.cotsInfoSignalsService.moveAssemblies({
      bomIds: bomIdsNumber,
      moveType,
      projectInfoId: this._inputData?.projectInfoId,
      scenarioId: this._inputData?.scenarioId,
      partInfoId: +this.selectedPartInfoId,
    });
    this.updateIsPartMoved(this.treeViewData, bomIds, movedChildren, !this.selectedPartisMoved);
    // } else {
    // this._store.dispatch(new CotsInfoAction.MoveAssembliesInfo(bomIdsNumber, 'toCatalogue', this._inputData?.projectInfoId, this._inputData?.scenarioId, +this.selectedPartInfoId));
    // updateIsPartMoved(this.treeViewData, true);
    // }
    //uncheck the checked nodes
    Object.keys(this.selectionKeys).forEach((key) => {
      if (this.selectionKeys[key]) {
        this.selectionKeys[key].checked = false;
      }
    });
    //enable all
    this.disableOppositeNodes(this.treeViewData, null);
    this.cdr.detectChanges();
    this.isAnyMoveDone = true;
  }

  private getChildNodes(node: TreeNode): TreeNode[] {
    let children: TreeNode[] = [];
    if (node.children?.length) {
      node.children.forEach((child) => {
        children.push(child);
        children = [...children, ...this.getChildNodes(child)];
      });
    }
    return children;
  }

  private updateIsPartMoved(nodes: any[], bomIds: string[], movedChildren: TreeNode[], value: boolean) {
    nodes.forEach((node) => {
      if (bomIds.includes(node.key) || movedChildren.some((c) => c.key === node.key)) {
        node.data.isPartMoved = value;
      }
      if (node.children?.length) {
        this.updateIsPartMoved(node.children, bomIds, movedChildren, value);
      }
    });
  }

  private getAllDescendantKeys(node: any): string[] {
    let keys: string[] = [];
    if (node.children && node.children.length) {
      for (const child of node.children) {
        keys.push(child.key);
        keys = keys.concat(this.getAllDescendantKeys(child));
      }
    }
    return keys;
  }

  clearSearch() {
    this.globalFilter = '';
    this.tt.filterGlobal('', 'contains');
  }

  private getNodesByKeys(keys: string[], nodes: any[]): any[] {
    let result: any[] = [];

    for (const node of nodes) {
      if (keys.includes(node.key)) {
        result.push(node);
      }

      if (node.children?.length > 0) {
        result.push(...this.getNodesByKeys(keys, node.children));
      }
    }

    return result;
  }

  private mapCostSummaryToBomTree(bomTree: BomTreeModel[]): TreeNode[] {
    return bomTree.map((part) => {
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
      const node: TreeNode = {
        key: part.bomId.toString(),
        data: {
          ...part,
          thumbnailImage,
          icon,
        },
        children: part.children?.length ? this.mapCostSummaryToBomTree(part.children) : [],
      };
      return node;
    });
  }

  private injectThumbnailsIntoTree(): void {
    if (!this._bomTreeImages.length || !this.treeViewData.length) return;
    const updatedTree = this.updateThumbnailsRecursively(this.treeViewData, this._bomTreeImages);
    this.treeViewData = updatedTree;
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

  onCheckboxChange(event: any, node: any) {
    const checked = event.checked;
    this.selectionKeys[node.key].checked = checked;
    if (checked) {
      // this.isMoveDisabled = !Object.values(this.selectionKeys || {}).some((sel: any) => sel.checked);
      const selectedStatus = node.data.isPartMoved;
      let currentParent = node.parent;
      // Disable parent nodes if any child has a different isPartMoved status
      while (currentParent) {
        const hasMismatch = currentParent.children.some((child) => child.data.isPartMoved !== selectedStatus);
        if (hasMismatch) {
          currentParent.disabled = true;
        }
        currentParent = currentParent.parent;
      }
      // this.cdr.detectChanges();
      // Disable all nodes with the opposite isPartMoved value
      this.disableOppositeNodes(this.treeViewData, selectedStatus);
    } else {
      // If unchecked and nothing else is selected, enable all again
      const anyStillSelected = Object.keys(this.selectionKeys).filter((key) => this.selectionKeys[key].checked);
      const childKeys = this.getAllDescendantKeys(node); // get all descendant keys
      if (anyStillSelected.length === 0 || anyStillSelected.every((k) => childKeys.includes(k))) {
        this.disableOppositeNodes(this.treeViewData, null);
      }
    }
    // update all children w.r.to parent node
    // const updateChildren = (children: any[], checked: boolean) => {
    //   for (const child of children) {
    //     this.selectionKeys[child.key].checked = checked;
    //     child.disabled = checked;
    //     if (child.children?.length > 0) {
    //       updateChildren(child.children, checked);
    //     }
    //   }
    // };
    this.updateCheckedChildren(node.children || [], checked);
    this.cdr.detectChanges();
  }

  updateCheckedChildren(children: any[], checked: boolean) {
    for (const child of children) {
      this.selectionKeys[child.key].checked = checked;
      child.disabled = checked;
      if (child.children?.length > 0) {
        this.updateCheckedChildren(child.children, checked);
      }
    }
  }

  private disableOppositeNodes(nodes: any[], allowedStatus: boolean | null) {
    for (const n of nodes) {
      if (allowedStatus === null) {
        n.disabled = false; // enable all
      } else {
        // n.disabled = n.data.isPartMoved !== allowedStatus;
        n.disabled ||= n.data.isPartMoved !== allowedStatus; // disable nodes with opposite isPartMoved status
      }
      if (n.children?.length > 0) {
        this.disableOppositeNodes(n.children, allowedStatus);
      }
    }
  }

  onPartThumbnailClick(partInfoId: number) {
    this.partThumbnailHelperService.onPartThumbnailClick(partInfoId);
    // this.blockUiService.pushBlockUI('open3DViewer');
    // this.searchService
    //   .getExtractionInfo([partInfoId])
    //   .pipe(takeUntil(this.unsubscribeAll$))
    //   .subscribe({
    //     next: (result: AiSearchTileExtractionInfoDto[]) => {
    //       const item = result[0];
    //       const extractedData = {
    //         material: JSON.parse(item?.materialInfoJson),
    //         process: JSON.parse(item?.processInfoJson),
    //       };
    //       const fileName = item.fileName;
    //       const modalRef = this.modalService.open(CadViewerPopupComponent, {
    //         windowClass: 'fullscreen',
    //       });
    //       modalRef.componentInstance.fileName = fileName;
    //       modalRef.componentInstance.partData = {
    //         caller: 'bom-details',
    //         partId: partInfoId,
    //         volume: extractedData?.material?.DimVolume,
    //         surfaceArea: extractedData?.material?.DimArea,
    //         projectedArea: extractedData?.material?.ProjectedArea,
    //         dimentions: {
    //           dimX: extractedData?.material?.DimX,
    //           dimY: extractedData?.material?.DimY,
    //           dimZ: extractedData?.material?.DimZ,
    //         },
    //         centerMass: {
    //           centroidX: extractedData?.process?.CentroidX,
    //           centroidY: extractedData?.process?.CentroidY,
    //           centroidZ: extractedData?.process?.CentroidZ,
    //         },
    //       };
    //       this.blockUiService.popBlockUI('open3DViewer');
    //     },
    //   });
  }

  dismissAll() {
    this.modalService.dismissAll();
    if (this.isAnyMoveDone) {
      // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(this._inputData?.projectInfoId, this._inputData?.scenarioId));
      this.bomInfoSignalsService.getBomTreeByProjectId(this._inputData?.projectInfoId, this._inputData?.scenarioId);
      this.cotsInfoSignalsService.getCotsInfoByPartInfoId(this.selectedPartInfoId);
    }
    this.outputData.emit(this.isAnyMoveDone);
  }
}
