import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, effect } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { ITreeState, ITreeOptions, TreeComponent, TreeNode } from '@ali-hm/angular-tree-component';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
// import { BomTreeState } from 'src/app/modules/_state/bom.state';
import { BomList, BomTreeModel, TreeAttribute, TreeState } from 'src/app/shared/models/bom-tree-viewmodel';
import { MetaDataModel } from 'src/app/shared/models/metaDataModel';
import { AppConfigurationService, BomService, CadService, BlockUiService } from 'src/app/shared/services';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import { BomCostSummaryComponent } from '../bom-cost-summary/bom-cost-summary.component';
import { BomMoveComponent } from '../bom-move/bom-move.component';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
// import * as CotsInfoAction from 'src/app/modules/_actions/cots-info.action';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { AddBOmService, AddBomConfirmationDialogConfig } from '../../services/add-bom-services';
import { Basic3dViewer } from '../cad-viewer-popup/Common/basic3dviewer';
import { BaseExample } from '../cad-viewer-popup/Common/BaseExample';
// import { ScenarioState } from 'src/app/modules/_state/project-scenario.state';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
// import * as ScenarioAction from 'src/app/modules/_actions/project-scenario-action';
// import { AddScenarioComponent } from '../add-scenario/add-scenario.component';
// import { CompareScenariosComponent } from '../compare-scenarios/compare-scenarios.component';
import { ProgressBarComponent } from 'src/app/shared/components';
import { DynamicComponentDirective } from 'src/app/directives/dynamic-component-directive';
// import { EditScenarioComponent } from '../edit-scenario/edit-scenario.component';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';
// import { PartInfoDto } from 'src/app/shared/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { UserInfoService } from 'src/app/shared/services/user-info-service';
// import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
// import { SharedService } from '../../services/shared.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedSignalsService } from 'src/app/shared/signals/shared-signals.service';
import { DocumentConversion } from 'src/app/shared/models/document-conversion.model';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { ProjectScenarioSignalsService } from 'src/app/shared/signals/project-scenario-signals.service';

declare const $: any;
@Component({
  selector: 'app-costing-project-bom-details',
  templateUrl: './costing-project-bom-details.component.html',
  styleUrls: ['./costing-project-bom-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, DynamicComponentDirective, MatTooltipModule],
})
export class CostingProjectBomDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() manualSelectedScenario: ProjectScenarioDto;
  @Input() selectedProjectId: number;
  @Input() commodityId: number;
  @Input() canUpdate: boolean = false;
  @Input() azureSharedId: string;
  @Input() savedPartInfoId!: { id: number };
  @Output() bomObj: EventEmitter<any> = new EventEmitter<any>();
  // @Output() scenarioChange: EventEmitter<any> = new EventEmitter<ProjectScenarioDto>();
  // @Input() currentDoc: DocumentRecordDto;
  @Input() _pData!: any;
  @ViewChild('tree') scenario: TreeComponent;
  @ViewChild(DynamicComponentDirective, { static: true }) dynamicComponentHost!: DynamicComponentDirective;
  @ViewChild('searchBomInput') searchBomInput!: ElementRef<HTMLInputElement>;
  scrollPosition = 0;
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  public currentProjectId: number;
  public state: ITreeState;
  public options: ITreeOptions;
  public scenarioState: ITreeState;
  public scenarioOptions: ITreeOptions;
  public bomList: BomTreeModel[];
  public scenarioList: ProjectScenarioDto[];
  public costingBomInfoform: FormGroup;
  public metaDataModel: MetaDataModel;
  private unSubscribeAll$ = new Subject<void>();
  modalRef: NgbModalRef;
  // private userInfoService = inject(UserInfoService);
  // canUpdate: boolean = false;
  closeResult = '';
  logisticsCompletionPercentage: any = '20';
  mode = 'donut';
  private partId: string;
  private partQuantinty: string;
  selectedScenario: number;
  aJSTreesConfig: any;
  listData = [];
  bomTreeImages: DocumentConversion[] = [];
  // private isAdmin: boolean = false;
  // sharedService = inject(SharedService);

  // hasAnySectionChangeEventSub$: Subscription = Subscription.EMPTY;
  imgUrl: string;
  _bomTreeSub$: Observable<BomTreeModel[]>;
  // _scenarioList$: Observable<ProjectScenarioDto[]>;
  _dataExtraction$: Observable<DataExtraction>;
  // _partInfo$: Observable<PartInfoDto>;
  // currentUserId: number = 0;
  // @Input() selectedProject: any;
  // public purchasePartButton = {
  //   class: 'default',
  //   text: 'Select Purchase Part(s)',
  // };
  selectedPartisMoved: boolean;
  treeHasChildren = false;
  extractedData: any;
  bomInfo: any;
  modalImage: string;
  isAnyMoveDone: boolean;
  bomInfoEffect = effect(() => {
    const bomtree = this.bomInfoSignalsService.bomTree();
    if (bomtree && bomtree?.length > 0) {
      this.bomList = (bomtree?.length && [...bomtree]) || [];
      this.getBomDetailsByProjectId();
    }
  });
  projectScenarioEffect = effect(() => {
    const projectScenario = this.projectScenarioSignalsService.projectScenario();
    if (projectScenario) {
      this.scenarioList = projectScenario;
    }
  });

  constructor(
    private messaging: MessagingService,
    private addbomservice: AddBOmService,
    private cadService: CadService,
    private modalService: NgbModal,
    protected appConfigurationService: AppConfigurationService,
    private _store: Store,
    private _bomService: BomService,
    private blockUiService: BlockUiService,
    private sharedSignal: SharedSignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private projectScenarioSignalsService: ProjectScenarioSignalsService
    // private ngZone: NgZone
  ) {
    // this._bomTreeSub$ = this._store.select(BomTreeState.getBomTree);
    // this._scenarioList$ = this._store.select(ScenarioState.getAllActiveScenarioByProjectId);
    this._dataExtraction$ = this._store.select(DataExtractionState.getDataExtraction);
    // this._partInfo$ = this._store.select(PartInfoState.getPartInfo);

    this._canUserUpdateCosting$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((result: boolean) => {
      if (result) {
        this.canUpdate = result;
      }
    });
    // this.userInfoService.getUserValue().subscribe((user) => {
    //   this.currentUserId = user?.userId;
    //   this.isAdmin = user?.roleId === 1;
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedProjectId'] && changes['selectedProjectId'].currentValue != changes['selectedProjectId'].previousValue) {
      this.currentProjectId = changes['selectedProjectId'].currentValue;
      this.dispatchToGetBom(this.currentProjectId);
      // this.selectedProject = localStorage.getItem('lastVisitedProject') ? JSON.parse(localStorage.getItem('lastVisitedProject')) : '';
      if (this.searchBomInput && this.searchBomInput.nativeElement.value) {
        this.searchBomInput.nativeElement.value = '';
      }
    }

    if (changes.azureSharedId && changes.azureSharedId.currentValue) {
      this.clearViewer(this.azureSharedId);
      // if (this.metaDataModel && this.metaDataModel?.fileName) {
      // const cadImageObj = new BaseExample(new Basic3dViewer('file-viewer'), this._store);
      // cadImageObj.initModelSelector(this.metaDataModel.fileName);
      // }
    }
  }

  public clearViewer(azureSharedId = '') {
    const container = document.getElementById('file-viewer');
    container?.replaceChildren();
    this.metaDataModel = { fileName: azureSharedId };
  }

  dispatchToGetBom(projectInfoId: number) {
    if (projectInfoId > 0) {
      // this._store.dispatch(new ScenarioAction.GetAllActiveScenarioByProjectId(projectInfoId));
      // this._store.dispatch(new ScenarioAction.GetAllPartScenarioByProjectId(projectInfoId));
      // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(projectInfoId, 0));
      this.projectScenarioSignalsService.getAllActiveScenarioByProjectId(projectInfoId);
      this.projectScenarioSignalsService.GetAllPartScenarioByProjectId(projectInfoId);
      this.bomInfoSignalsService.getBomTreeByProjectId(projectInfoId, 0);
    }
  }

  ngOnInit() {
    this.listData = [];
    // this.loadPartDetailsFromLocalStorage(); // fix for flickering
    // this.loadScenarioList();
    // this.getBomDetailsByProjectId();
    this.scenarioOptions = {
      allowDrag: false,
      useTriState: false,
      allowDragoverStyling: true,
      getNodeClone: (node) => ({
        ...node.data,
        name: `copy of ${node.data.name}`,
      }),
      animateExpand: true,
      actionMapping: {
        mouse: {},
      },
    };

    this.scenarioState = {
      expandedNodeIds: {
        1: true,
        2: true,
      },
      hiddenNodeIds: { 0: true },
      activeNodeIds: {},
    };
    this.getExtractedData();
    // this.canUserUpdate();
  }
  // private canUserUpdate() {
  // this.canUpdate = this.isAdmin || this.currentUserId === this.selectedProject?.createdUserId || this.selectedProject?.projectUserDtos?.find((x) => x.userId === this.currentUserId) !== undefined;
  // }
  expandAllScenarioNodes() {
    this.scenario.treeModel.expandAll();
  }

  // public onSelectScenarioClick(event: any, node: any) {
  //   const isDirty = this._pData.checkIfDirty();
  //   if (isDirty) {
  //     const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
  //       data: {
  //         title: 'Confirm Leave',
  //         message: 'You have unsaved data which will be lost. Do you still want to proceed?',
  //         action: 'CONFIRM',
  //         cancelText: 'CANCEL',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //       if (!confirmed) {
  //         event.preventDefault();
  //         return;
  //       } else {
  //         if (node) {
  //           this._store.dispatch(new BomActions.GetBomsTreeByProjectId(node.projectInfoId, node.scenarioId));
  //           this.scenarioChange.emit(node);
  //         }
  //       }
  //     });
  //   } else {
  //     if (node) {
  //       this._store.dispatch(new BomActions.GetBomsTreeByProjectId(node.projectInfoId, node.scenarioId));
  //       this.scenarioChange.emit(node);
  //     }
  //   }
  // }

  // public compareScenarios() {
  //   const modalRef = this.modalService.open(CompareScenariosComponent, { windowClass: 'modal-xl h-full min-h-0 scenario-modal' });
  //   modalRef.componentInstance.projectInfoId = this.currentProjectId;
  //   modalRef.componentInstance.projectName = this.selectedProject?.projectName;
  // }

  // public editScenarioCall(node: any) {
  //   if (node) {
  //     const modalRef = this.modalService.open(EditScenarioComponent, { windowClass: 'modal-l' });
  //     modalRef.componentInstance.scenarioData = node;
  //     modalRef.componentInstance.projectName = this.selectedProject?.projectName;
  //   }
  // }

  // public addScenario(event: any) {
  //   const isDirty = this._pData.checkIfDirty();
  //   if (isDirty) {
  //     const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
  //       data: {
  //         title: 'Confirm Leave',
  //         message: 'You have unsaved data which will be lost. Do you still want to proceed?',
  //         action: 'CONFIRM',
  //         cancelText: 'CANCEL',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //       if (!confirmed) {
  //         event.preventDefault();
  //         return;
  //       } else {
  //         this.addScenarioCall();
  //       }
  //     });
  //   } else {
  //     this.addScenarioCall();
  //   }
  // }

  // public addScenarioCall() {
  //   const modalRef = this.modalService.open(AddScenarioComponent, { windowClass: 'modal-xl' });
  //   modalRef.componentInstance.projectInfoId = this.currentProjectId;
  //   modalRef.componentInstance.projectName = this.selectedProject?.projectName;
  // }

  // public onSelectDeleteScenarioClick(event: any, node: any) {
  //   if (node) {
  //     const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
  //       data: {
  //         title: 'Confirm Delete',
  //         message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
  //         action: 'CONFIRM',
  //         cancelText: 'CANCEL',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //       if (!confirmed) {
  //         return;
  //       } else {
  //         this._store.dispatch(new ScenarioAction.RemoveScenario(Number(node.projectInfoId), node.scenarioId));
  //         this.messaging.openSnackBar(`Data has been delete successfully.`, '', { duration: 5000 });
  //       }
  //     });
  //   }
  // }

  // public onDeleteScenarioClick(event: any, node: any) {
  //   if (node?.data) {
  //     const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
  //       data: {
  //         title: 'Confirm Delete',
  //         message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
  //         action: 'CONFIRM',
  //         cancelText: 'CANCEL',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //       if (!confirmed) {
  //         return;
  //       } else {
  //         this._store.dispatch(new ScenarioAction.RemoveScenario(Number(node.data.projectInfoId), node.data.scenarioId));
  //         this.messaging.openSnackBar(`Data has been delete successfully.`, '', { duration: 5000 });
  //       }
  //     });
  //   }
  // }

  getAllChildrenIDs(node: TreeNode): TreeNode | null {
    let res: TreeNode = {} as TreeNode;
    if (node.data.partInfoId == this.partId) {
      res = node;
      return res;
    }

    for (const children of node.children) {
      return this.getAllChildrenIDs(children);
    }
    return null;
  }

  setTreebom(bomList: BomTreeModel, parent: string, type: string, selected: boolean) {
    const data = new BomList();
    data.id = bomList.bomId.toString();
    data.parent = parent;
    if (bomList.isPartMoved) {
      data.text = '<span class="inbom text-black">' + bomList.name + '</span>';
    } else {
      data.text = '<span class="inbom">' + bomList.name + '</span>';
    }
    data.partInfoId = bomList.partInfoId;
    data.bomId = bomList.bomId;
    data.type = type;
    data.partQty = bomList.partQty;
    data.projectInfoId = bomList.projectInfoId;
    data.isPartMoved = bomList.isPartMoved;
    const state = new TreeState();
    state.selected = selected;
    state.percentage = bomList.dataCompletionPercentage;
    if (bomList.children.length > 0) {
      state.opened = true;
    }
    data.state = state;

    if (bomList.intPartDescription) {
      const attr = new TreeAttribute();
      attr.title = bomList.intPartDescription;
      data.attr = attr;
    }

    this.listData.push(data);

    for (const child of bomList.children) {
      let type = 'part';
      if (child.children.length > 0) {
        type = 'assembly';
      }
      this.setTreebom(child, data.id, type, false);
    }
  }

  setTreeconfig() {
    $('#bomjstree').jstree('destroy');
    const aJSTreesConfig = {
      core: {
        multiple: false,
        check_callback: true,
        themes: {
          dots: false,
          icons: true,
        },
        // data: this.listData,
        data: this.listData.map((node) => {
          if (node.isPartMoved) {
            const icon = `<img src="/assets/icons/move-icon-grey.svg" alt="moved icon" class="movable-icon" />`;
            node.text = `${node.text} ${icon}`;
          }
          return node;
        }),
      },
      types: {
        file: {
          icon: 'icon-file',
        },
        assembly: {
          icon: 'icon-assembly',
        },
        instance: {
          icon: 'icon-instance',
        },
        part: {
          icon: 'icon-part',
        },
      },
      // plugins: ['wholerow', 'types', 'checkbox', 'contextmenu', 'search'],
      plugins: ['wholerow', 'types', 'contextmenu', 'search'],
      // checkbox: {
      //   keep_selected_style: false, // prevent automatic highlighting of selected nodes
      //   // "cascade": 'down', // parent is selected the children are selected/unselected (Not viceversa)
      //   three_state: false, // parent/child nodes don't cascade selection
      //   tie_selection: false, // selection of the checkbox and node dont initiate selection
      //   whole_node: false, // selection of the checkbox dont initiate the node selection, but selection of node initiate selection
      // },
      contextmenu: {
        select_node: false,
        show_at_node: false,
        items: (node) => {
          console.log('oncontextmenu', node);
          if (!this.canUpdate) {
            return {};
          }
          return {
            Remove: {
              label: 'Delete Part',
              icon: '/assets/images/trash.svg',
              action: () => {
                this.removeBomClick(node.id);
              },
            },
          };
        },
      },
    };

    // $('#bomjstree').jstree(true);
    $('#bomjstree')
      .off('.jstree')
      .jstree(aJSTreesConfig)
      // .on('ready.jstree', () => {
      //   $('#bomjstree').find('li > a').append($('<span class="contextmenu-icon">&#x22EE;</span>')); // contextmenu icon
      // })
      .on('ready.jstree', function () {
        const tree = $('#bomjstree').jstree(true);

        $('#bomjstree')
          .find('li')
          .each((index, element) => {
            const nodeId = $(element).attr('id');
            const node = tree.get_node(nodeId);
            if (node && node.original && node.original.isPartMoved === true) {
              // Add the title to the li (for default browser tooltip)
              $(element).attr('title', 'Moved to Purchase Parts Catalogue');
            }

            if (!node.original || !node.original.isPartMoved) {
              $(element).children('a').append($('<span class="contextmenu-icon">&#x22EE;</span>'));
            }
          });
      })

      .on('loaded.jstree', () => {
        const jstreeData = $('#bomjstree').jstree(true).get_json('#', { flat: true });
        this.treeHasChildren = false;
        // this.purchasePartButton = {
        //   class: 'default',
        //   text: 'Select Purchase Part(s)',
        // };
        this.addProgressBar(jstreeData);
        // $('#bomjstree').jstree(true).hide_checkboxes(); // hide all checkbox in the beginning

        // $('#bomjstree').jstree().deselect_all(true);
        const bomId = this.bomInfo?.bomId;
        // const bomId = localStorage.getItem('selectedbomId');
        $('#bomjstree').jstree()?.select_node(bomId);
      })
      // .on('uncheck_node.jstree', (e, selectedNode) => {
      //   if ($('#bomjstree').jstree(true).get_checked().length === 0) {
      //     // if non checked, enable all checbox
      //     this.enableAllCheckboxes();
      //     this.addProgressBar($('#bomjstree').jstree(true).get_json('#', { flat: true }));

      //     this.purchasePartButton = {
      //       class: 'red',
      //       text: 'Cancel Moving Purchase Part(s)',
      //     };
      //   } else {
      //     const getChildrenNodes = (nodeId) => {
      //       if (this.listData.filter((x) => x.id === nodeId && x.isPartMoved).length === 0) {
      //         // only proceed if isPartMoved is false
      //         const childrenNodeIds = $('#bomjstree').jstree(true).get_node(nodeId).children;
      //         childrenNodeIds.forEach((childNodeId) => {
      //           if (this.listData.filter((x) => x.id === childNodeId)[0].isPartMoved === this.selectedPartisMoved) {
      //             $('#bomjstree').jstree(true).enable_checkbox(childNodeId);
      //           }
      //           getChildrenNodes(childNodeId);
      //         });
      //       }
      //     };
      //     getChildrenNodes(selectedNode.node.id);
      //   }
      //   // let selectedNode = selectedNode.node;
      //   // if (selectedNode && selectedNode.children.length > 0) {
      //   //   selectedNode.children.forEach(childNode => {
      //   //     if (!$('#bomjstree').jstree(true).is_disabled(childNode)) {
      //   //       $('#bomjstree').jstree(true).enable_checkbox(childNode);
      //   //     }
      //   //   });
      //   // }
      // })
      // .on('check_node.jstree', (e, selectedNode) => {
      //   if ($('#bomjstree').jstree(true).get_checked().length === 1) {
      //     // if one checked, enable checbox by isPartMoved flag
      //     this.selectedPartisMoved = this.listData.filter((node) => node.id === selectedNode.node.id)[0].isPartMoved;
      //     const nodesToDisable = [];
      //     this.listData.forEach((node) => {
      //       if (node.isPartMoved !== this.selectedPartisMoved) {
      //         nodesToDisable.push(node.id);
      //       }
      //     });
      //     $('#bomjstree').jstree(true).disable_checkbox(nodesToDisable);

      //     this.purchasePartButton = {
      //       class: 'red',
      //       text: 'Move Purchase Part(s)',
      //     };
      //   }
      //   $('#bomjstree').jstree(true).uncheck_node(this.getChildNodes(selectedNode.node));
      //   $('#bomjstree').jstree(true).disable_checkbox(this.getChildNodes(selectedNode.node));

      //   // let selectedNode = data.node;
      //   // if (selectedNode && selectedNode.children.length > 0) {
      //   //   selectedNode.children.forEach(childNode => {
      //   //     if (!$('#bomjstree').jstree(true).is_disabled(childNode)) {
      //   //       $('#bomjstree').jstree(true).check_node(childNode);
      //   //       $('#bomjstree').jstree(true).disable_checkbox(childNode);
      //   //     }
      //   //   });
      //   // }
      // })
      .on('select_node.jstree', (theEvent: any, theData: any) => {
        if (this.listData.filter((x) => x.id === theData.node.id && x.isPartMoved).length === 0) {
          // dont select moved nodes
          this.onBomClick(theEvent, theData.node);
        } else {
          const bomId = this.bomInfo?.bomId;
          // const bomId = localStorage.getItem('selectedbomId');
          $('#bomjstree').jstree()?.deselect_node(theData.node.original?.bomId);
          $('#bomjstree').jstree()?.select_node(bomId);
        }
      })
      .on('open_node.jstree', () => {
        const jstreeData = $('#bomjstree').jstree(true).get_json('#', { flat: true });
        this.addProgressBar(jstreeData);
      })
      .on('ready.jstree loaded.jstree', () => {
        if (this.savedPartInfoId?.id > 0) {
          this.restoreScrollAfterTreeBuild();
          this.savedPartInfoId.id = 0;
        }
      })
      .off('click', '.contextmenu-icon') // to avoid duplicate
      .on('click', '.contextmenu-icon', (e) => {
        e.preventDefault(); // Prevent the default anchor navigation
        e.stopPropagation(); // Prevent node selection
        const $target = $(e.currentTarget);
        const $li = $target.closest('li');
        const node = $('#bomjstree').jstree(true).get_node($li.attr('id'));

        // Trigger jsTree context menu manually
        const offset = $target.offset();
        $('#bomjstree')
          .jstree(true)
          .show_contextmenu(node, offset.left, offset.top + $target.height());
      });

    $(window).on('scroll', () => {
      $('.vakata-context')?.length > 0 && $('.vakata-context').remove();
    });
    $('.jstree-bom-container, .scroll-details-section').on('scroll', () => {
      $('.vakata-context')?.length > 0 && $('.vakata-context').remove();
    });
  }

  searchBom(e) {
    $('#bomjstree').jstree(true).search(e.currentTarget?.value);
  }

  onEnterSearch(e) {
    this.searchBom(e);
    const highlightedNodes = $('#bomjstree').find('.jstree-search');
    for (let i = 0; i < highlightedNodes.length; i++) {
      const nodeId = $(highlightedNodes[i]).closest('li').attr('id');
      const node = $('#bomjstree').jstree(true).get_node(nodeId);
      if (node.original?.type === 'part') {
        // leaf node
        $('#bomjstree').jstree(true).deselect_all();
        $('#bomjstree').jstree(true).select_node(nodeId);
        break;
      }
    }
  }

  restoreScrollAfterTreeBuild() {
    requestAnimationFrame(() => {
      const el = this.scrollBox.nativeElement;
      el.scrollTop = this.scrollPosition;
    });
  }

  // moveCheckedNodes(action: string) {
  //   const selectedNodes = $('#bomjstree').jstree(true).get_checked('full');
  //   const bomIds = selectedNodes.map((node) => node.id);
  //   console.log(bomIds, this.currentProjectId, this.selectedScenario, +this.partId);
  //   if (bomIds.length > 0) {
  //     let childNodes = [];
  //     let deleteMsg = '';

  //     /** Check if delete message needs to be shown */
  //     if (!this.selectedPartisMoved) {
  //       selectedNodes.forEach((selectedNode) => {
  //         childNodes = [...childNodes, ...this.getChildNodes($('#bomjstree').jstree(true).get_node(selectedNode.id))];
  //       });
  //       for (const selectedNode of childNodes) {
  //         if (this.listData.filter((x) => x.id === selectedNode && x.isPartMoved).length > 0) {
  //           deleteMsg = '<br /><br /><span class="cancel-icon">Note: All existing child parts of the selected items will be removed from the Purchase Parts Catalogue.</span>';
  //           break;
  //         }
  //       }
  //     }

  //     const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
  //       data: {
  //         title: this.selectedPartisMoved ? 'Confirm Moving Part(s) Back to Manufactured Parts' : 'Confirm Moving to Purchase Parts Catalogue',
  //         message: 'Confirm Moving the Purchase Part by selecting CONFIRM, or cancel this action by selecting CANCEL.' + deleteMsg,
  //         action: 'CONFIRM',
  //         cancelText: 'CANCEL',
  //       },
  //     });
  //     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //       if (!confirmed) {
  //         return;
  //       } else {
  //         let movedChildren = [];
  //         if (this.selectedPartisMoved) {
  //           this._store.dispatch(new CotsInfoAction.MoveAssembliesInfo(bomIds, 'toBom', this.currentProjectId, this.selectedScenario, +this.partId));
  //           selectedNodes.forEach((node) => {
  //             movedChildren = [...movedChildren, ...this.getChildNodes(node)];
  //           });
  //           this.listData = this.listData.map((node) => {
  //             if (bomIds.includes(node.id) || movedChildren.includes(node.id)) {
  //               node.isPartMoved = false;
  //             }
  //             return node;
  //           });
  //         } else {
  //           this._store.dispatch(new CotsInfoAction.MoveAssembliesInfo(bomIds, 'toCatalogue', this.currentProjectId, this.selectedScenario, +this.partId));
  //           selectedNodes.forEach((node) => {
  //             movedChildren = [...movedChildren, ...this.getChildNodes(node)];
  //           });
  //           this.listData = this.listData.map((node) => {
  //             if (bomIds.includes(node.id) || movedChildren.includes(node.id)) {
  //               node.isPartMoved = true;
  //             }
  //             return node;
  //           });
  //           const selectedBomId = this.bomInfo?.bomId;
  //           // const selectedBomId = localStorage.getItem('selectedbomId');
  //           if ([...bomIds, ...movedChildren].includes(selectedBomId)) {
  //             $('#bomjstree').jstree()?.deselect_node(selectedBomId);
  //             $('#bomjstree').jstree(true).select_node($('#bomjstree').jstree(true).get_node('#').children[0]);
  //           }
  //         }
  //         $('#bomjstree').jstree(true).uncheck_all();
  //         this.enableAllCheckboxes();
  //         this.addProgressBar($('#bomjstree').jstree(true).get_json('#', { flat: true }));
  //         this.moveCheckedNodes('hideCheckbox');
  //       }
  //     });
  //   } else if (action === 'showCheckbox' && this.purchasePartButton.class === 'default') {
  //     $('#bomjstree').jstree(true).show_checkboxes();
  //     this.purchasePartButton = {
  //       class: 'red',
  //       text: 'Cancel Moving Purchase Part(s)',
  //     };
  //   } else if (action === 'hideCheckbox' || bomIds.length <= 0) {
  //     $('#bomjstree').jstree(true).hide_checkboxes();
  //     this.purchasePartButton = {
  //       class: 'default',
  //       text: 'Select Purchase Part(s)',
  //     };
  //   }
  // }

  // private getChildNodes(node: any) {
  //   let movedChildren = [];
  //   if (node && node?.children?.length > 0) {
  //     node.children.forEach((childNode) => {
  //       const childObj = $('#bomjstree').jstree(true).get_node(childNode);
  //       movedChildren.push(childNode);
  //       movedChildren = [...movedChildren, ...this.getChildNodes(childObj)]; // recursive call
  //     });
  //   }
  //   return movedChildren;
  // }

  private changeChildrenNodeClass(node: any, fromClass: string, toClass: string) {
    let movedChildren = [];
    if (node && node?.children?.length > 0) {
      node.children.forEach((childNode) => {
        const childObj = $('#bomjstree').jstree(true).get_node(childNode);
        fromClass !== '' && this.changeNodeClass(childObj, fromClass, toClass);
        (fromClass === 'inbom' || fromClass === '') && $('#bomjstree').jstree(true).disable_checkbox(childNode);
        movedChildren.push(childNode);
        movedChildren = [...movedChildren, ...this.changeChildrenNodeClass(childObj, fromClass, toClass)]; // recursive call
      });
    }
    return movedChildren;
  }

  onScroll() {
    this.scrollBox.nativeElement.scrollTop > 0 && (this.scrollPosition = this.scrollBox.nativeElement.scrollTop);
  }

  private enableAllCheckboxes() {
    $('#bomjstree')
      .jstree(true)
      .enable_checkbox(this.listData.map((x) => x.id));
  }

  private changeNodeClass(node: any, fromClass: string, toClass: string) {
    // Change the text style of the node
    const txt = node.text.replace(`class="${fromClass}"`, `class="${toClass}"`);
    $('#bomjstree').jstree(true).set_text(node.id, txt);

    // Change the color of the icon accordingly
    if ($('#bomjstree').jstree(true).get_icon(node.id).indexOf('icon-assembly') >= 0) {
      // const iconClass = toClass === 'moved' ? 'icon-assembly' : 'icon-assembly';
      const iconClass = 'icon-assembly';
      $('#bomjstree').jstree(true).set_icon(node.id, iconClass);
    } else if ($('#bomjstree').jstree(true).get_icon(node.id).indexOf('icon-part') >= 0) {
      // const iconClass = toClass === 'moved' ? 'icon-part' : 'icon-part';
      const iconClass = 'icon-part';
      $('#bomjstree').jstree(true).set_icon(node.id, iconClass);
      $('#' + node.id)
        .find('.jstree-ocl')
        .eq(0)
        .css('display', 'none');
    }
  }

  addProgressBar(nodes: any[]) {
    this.dynamicComponentHost?.viewContainerRef.clear();
    nodes.forEach((node) => {
      const nodeData = this.listData.find((x) => x.id === node.id);
      if (nodeData && !nodeData.isPartMoved) {
        if (node.parent === '#') {
          // to hide the checkbox for base level nodes
          $('#' + node.id)
            .find('.jstree-checkbox')
            .eq(0)
            .css('display', 'none');
          this.changeChildrenNodeClass($('#bomjstree').jstree(true).get_node(node), 'moved', 'inbom');
        } else {
          this.treeHasChildren = true;
        }
        if (this.listData.filter((x) => x.isPartMoved && x.id === node.id).length > 0) {
          // to change the color of moved nodes
          this.changeNodeClass(node, 'inbom', 'moved');
          this.changeChildrenNodeClass($('#bomjstree').jstree(true).get_node(node), 'inbom', 'moved');
        }

        const componentRef = this.dynamicComponentHost.viewContainerRef.createComponent(ProgressBarComponent);
        const hasChildren = node.children && node.children.length > 0;
        componentRef.instance.percentage = node.state.percentage;
        componentRef.instance.mode = this.mode;

        const spanElement = document.createElement('span');
        spanElement.className = 'progress-span';
        spanElement.appendChild(componentRef.location.nativeElement);

        const jstreeNode = document.getElementById(node.id);
        const existingElement = jstreeNode.querySelector('.jstree-anchor');
        if (existingElement) {
          existingElement.parentNode.insertBefore(spanElement, existingElement.nextSibling);
        } else {
          jstreeNode.appendChild(spanElement);
        }
        if (hasChildren) {
          this.addProgressBar(node.children);
        }
      }
    });
  }

  public getBomDetailsByProjectId() {
    // this._bomTreeSub$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((list: BomTreeModel[]) => {
    // if (list && list?.length > 0) {
    // if (!list || list.length == 0) {
    //   this.bomObj.emit({ partId: 0, partQty: 0 });
    // }
    // this.bomList = (list?.length && [...list]) || [];
    const firstScenario = this.scenarioList?.find((s) => s.sortOrder === 0);
    // this.selectedScenario = this.bomList[0].scenarioId;
    if (firstScenario && firstScenario?.scenarioId !== this.bomList[0].scenarioId && (!this.manualSelectedScenario || this.manualSelectedScenario.scenarioId === firstScenario.scenarioId)) {
      // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(this.currentProjectId, firstScenario?.scenarioId || 0));
      this.bomInfoSignalsService.getBomTreeByProjectId(this.currentProjectId, firstScenario?.scenarioId || 0);
    }
    if (this.bomList.length > 0) {
      this.listData = [];
      let i = 0;
      for (const bom of this.bomList) {
        i = i + 1;
        const type = 'file';
        let selected = false;
        if (i == 1 && (this.savedPartInfoId?.id ?? 0) === 0) {
          selected = true;
        }
        this.setTreebom(bom, '#', type, selected);
      }
      this.setTreeconfig();
    }
    if (!this.isAnyMoveDone) {
      const allPartInfoIds = this.getAllPartInfoIds(this.bomList);
      this._bomService
        .getImageViewByMultiplePartInfoIds(allPartInfoIds)
        .pipe(takeUntil(this.unSubscribeAll$))
        .subscribe((images) => {
          this.bomTreeImages = images;
          this.loadStaticImage();
          this.sharedSignal.setImages(images);
          if (this.modalRef && this.modalRef.componentInstance) {
            this.modalRef.componentInstance.bomTreeImages = this.bomTreeImages;
          }
        });
      const onSelectedPartInfoId = this.bomInfo?.partInfoId;
      const onSelectedPartParentPartId = this.bomInfo?.parentPartId;
      // let partInfoId = localStorage.getItem('selectedPartId');
      // let parentPartId = localStorage.getItem('selectedParentId');
      if (!this.savedPartInfoId?.id) {
        if (onSelectedPartInfoId && Number(onSelectedPartInfoId) > 0) {
          const selectedPartBomData = this.bomList?.find((x) => x.partInfoId === Number(onSelectedPartInfoId));
          if (!selectedPartBomData && Number(onSelectedPartParentPartId) > 0) {
            const selectedPartParentBomData = this.bomList?.find((x) => x.partInfoId === Number(onSelectedPartParentPartId));
            if (selectedPartParentBomData) {
              const childrenlist = selectedPartParentBomData.children?.find((x) => x.partInfoId === Number(onSelectedPartInfoId));
              if (childrenlist) {
                this.bomInfo = { bomId: childrenlist.bomId, partInfoId: childrenlist.partInfoId, partQty: childrenlist.partQty };
                // localStorage.setItem('selectedPartId', childrenlist.partInfoId.toString());
                // localStorage.setItem('selectedbomId', childrenlist.bomId.toString());
                // localStorage.setItem('selectedPartQuantinty', childrenlist.partQty.toString());
                this.partId = childrenlist.partInfoId.toString();
                this.selectedScenario = childrenlist.scenarioId;
                this.bomObj.emit({ partId: this.partId, partQty: childrenlist.partQty, bomId: childrenlist.bomId });
              } else if (this.bomList?.length > 0) {
                this.bomInfo = { bomId: this.bomList[0].bomId, partInfoId: this.bomList[0].partInfoId, partQty: this.bomList[0].partQty };
                // localStorage.setItem('selectedPartId', this.bomList[0].partInfoId.toString());
                // localStorage.setItem('selectedbomId', this.bomList[0].bomId.toString());
                this.partId = this.bomList[0].partInfoId.toString();
                this.selectedScenario = this.bomList[0].scenarioId;
                this.bomObj.emit({ partId: this.partId, partQty: this.bomList[0].partQty, bomId: this.bomList[0].bomId });
              }
            } else if (this.bomList?.length > 0) {
              this.bomInfo = { bomId: this.bomList[0].bomId, partInfoId: this.bomList[0].partInfoId, partQty: this.bomList[0].partQty };
              // localStorage.setItem('selectedPartId', this.bomList[0].partInfoId.toString());
              // localStorage.setItem('selectedbomId', this.bomList[0].bomId.toString());
              this.partId = this.bomList[0].partInfoId.toString();
              this.selectedScenario = this.bomList[0].scenarioId;
              this.bomObj.emit({ partId: this.partId, partQty: this.bomList[0].partQty, bomId: this.bomList[0].bomId });
            }
          } else if (this.bomList?.length > 0) {
            this.bomInfo = { bomId: this.bomList[0].bomId, partInfoId: this.bomList[0].partInfoId, partQty: this.bomList[0].partQty };
            // this.bomInfo = this.bomList[0];
            // localStorage.setItem('selectedPartId', this.bomList[0].partInfoId.toString());
            // localStorage.setItem('selectedbomId', this.bomList[0].bomId.toString());
            this.partId = this.bomList[0].partInfoId.toString();
            this.selectedScenario = this.bomList[0].scenarioId;
            this.bomObj.emit({ partId: this.partId, partQty: this.bomList[0].partQty, bomId: this.bomList[0].bomId });
          }
        } else {
          if (this.bomList?.length > 0) {
            this.bomInfo = { bomId: this.bomList[0].bomId, partInfoId: this.bomList[0].partInfoId, partQty: this.bomList[0].partQty };
            // localStorage.setItem('selectedPartId', this.bomList[0].partInfoId.toString());
            // localStorage.setItem('selectedbomId', this.bomList[0].bomId.toString());
            this.partId = this.bomList[0].partInfoId.toString();
            this.selectedScenario = this.bomList[0].scenarioId;
            this.bomObj.emit({ partId: this.partId, partQty: this.bomList[0].partQty, bomId: this.bomList[0].bomId });
          }
        }
      }
      // else {
      //   this.savedPartInfoId.id = 0;
      // }
    } else {
      this.isAnyMoveDone = false;
    }
    // }
    // });
  }

  public onBomClick(event: any, node: any) {
    const partId = this.bomInfo?.partInfoId;
    const partQuantinty = this.bomInfo?.partQty;
    const bomId = this.bomInfo?.bomId;
    // const partId = localStorage.getItem('selectedPartId');
    // const partQuantinty = localStorage.getItem('selectedPartQuantinty');
    // const bomId = localStorage.getItem('selectedbomId');
    if (Number(partId) === Number(node.original?.partInfoId) && Number(partQuantinty) === Number(node.original?.partQty) && bomId == node.original?.bomId) {
      return;
    }

    const isDirty = this._pData.checkIfDirty();
    if (isDirty) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Leave',
          message: 'You have unsaved data which will be lost. Do you still want to proceed?',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          $('#bomjstree').jstree()?.deselect_node(node.original?.bomId);
          $('#bomjstree').jstree()?.select_node(bomId);
          event.preventDefault();
          return;
        } else {
          this.selectData(node);
        }
      });
    } else {
      this.selectData(node);
    }
  }

  private selectData(node: any) {
    if (node?.original) {
      const partId = this.bomInfo?.partInfoId;
      const partQuantinty = this.bomInfo?.partQty;
      const bomId = this.bomInfo?.bomId;
      // const partId = localStorage.getItem('selectedPartId');
      // const partQuantinty = localStorage.getItem('selectedPartQuantinty');
      // const bomId = localStorage.getItem('selectedbomId');
      if (Number(partId) === Number(node.original?.partInfoId) && Number(partQuantinty) === Number(node.original?.partQty) && bomId == node.original?.bomId) {
        return;
      }
      this.bomObj.emit({
        partId: node.original.partInfoId,
        partQty: node.original.partQty,
        bomId: node.original.bomId,
      });
      this.partId = node.original.partInfoId;
      this.partQuantinty = node.original.partQty;
      const parentPartId = this.bomList.find((item) => item.bomId === Number(node.original.parent))?.partInfoId;
      this.bomInfo = { bomId: node.original.bomId, partInfoId: this.partId, partQty: this.partQuantinty, parentPartId };
      this.loadStaticImage();
      // localStorage.setItem('selectedPartId', JSON.stringify(this.partId));
      // localStorage.setItem(
      //   'selectedPartQuantinty',
      //   JSON.stringify(this.partQuantinty)
      // );
      // localStorage.setItem(
      //   'selectedbomId',
      //   JSON.stringify(node.original.bomId)
      // );
    }
  }

  loadStaticImage() {
    this.modalImage = this.bomTreeImages.find((x) => x.partInfoId === this.bomInfo?.partInfoId)?.thumbnailImage || '';
  }

  // loadScenarioList() {
  //   this._scenarioList$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((list: ProjectScenarioDto[]) => {
  //     this.scenarioList = list;
  //     // this.scenarioChange.emit(list[0]);
  //   });
  // }

  uploadFile = (files: any) => {
    if (files.length === 0) {
      return;
    }

    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('formFile', fileToUpload, fileToUpload.name);
    this.cadService
      .getMetaDataModel(formData)
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe((metaDataModel: MetaDataModel) => {
        if (metaDataModel) {
          this.metaDataModel = metaDataModel;
          const baseExample = new BaseExample(new Basic3dViewer('file-viewer'), this._store);
          baseExample.initModelSelector(this.metaDataModel.fileName);
        }
      });
  };

  getExtractedData() {
    this._dataExtraction$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((res: DataExtraction) => {
      if (res && res?.partInfoId > 0) {
        this.extractedData = {
          material: JSON.parse(res?.materialInfoJson),
          process: JSON.parse(res?.processInfoJson),
        };
      } else {
        this.extractedData = null;
      }
    });
  }

  async openCadViewer() {
    const fileName = this.metaDataModel.fileName;
    const modalRef = this.modalService.open(CadViewerPopupComponent, { windowClass: 'fullscreen' });
    modalRef.componentInstance.fileName = fileName;
    modalRef.componentInstance.partData = {
      caller: 'bom-details',
      commodityId: this.commodityId,
      partId: this.partId,
      volume: this.extractedData?.material?.DimVolume,
      surfaceArea: this.extractedData?.material?.DimArea,
      projectedArea: this.extractedData?.material?.ProjectedArea,
      dimentions: { dimX: this.extractedData?.material?.DimX, dimY: this.extractedData?.material?.DimY, dimZ: this.extractedData?.material?.DimZ },
      centerMass: { centroidX: this.extractedData?.process?.CentroidX, centroidY: this.extractedData?.process?.CentroidY, centroidZ: this.extractedData?.process?.CentroidZ },
    };
    const result = await modalRef.result;
    console.log('CAD Viewer Close Result', result);
    this.blockUiService.pushBlockUI('Cad Viewer');
    setTimeout(() => {
      if (result?.reopen && result?.caller !== '') {
        this.sharedSignal.openCadViewer.set({ caller: result?.caller });
      }
      this.blockUiService.popBlockUI('Cad Viewer');
    }, 1000);
  }

  // private loadPartDetailsFromLocalStorage() {
  //   this._partInfo$.pipe(takeUntil(this.unSubscribeAll$)).subscribe((result: PartInfoDto) => {
  //     if (result) {
  //       const bomDetails = result.billOfMaterialPartInfos[0];
  //       this.bomInfo = { bomId: bomDetails?.bomId, partInfoId: bomDetails?.partInfoId, partQty: bomDetails?.partQty, parentPartInfoId: bomDetails?.parentPartInfoId };
  //     }
  //     const partID: any = this.bomInfo?.partInfoId;
  //     const PartQuantinty: any = this.bomInfo?.partQty;
  //     const bomId = this.bomInfo?.bomId;
  //     if (partID != '' && partID != undefined) {
  //       this.partId = partID;
  //       this.partQuantinty = PartQuantinty;
  //       this.bomObj.emit({
  //         partId: partID,
  //         partQty: PartQuantinty,
  //         bomId: bomId,
  //       });
  //     }
  //   });
  //   // let partID: any = localStorage.getItem('selectedPartId');
  //   // let PartQuantinty: any = localStorage.getItem('selectedPartQuantinty');
  //   // let bomId = localStorage.getItem('selectedbomId');
  //   // if (partID != '' && partID != undefined) {
  //   //   this.partId = partID;
  //   //   this.partQuantinty = PartQuantinty;
  //   //   this.bomObj.emit({
  //   //     partId: partID,
  //   //     partQty: PartQuantinty,
  //   //     bomId: bomId,
  //   //   });
  //   // }
  // }

  getAllPartInfoIds(bomList: BomTreeModel[]): number[] {
    const partIds: number[] = [];

    function traverse(bomItems: BomTreeModel[]) {
      for (const item of bomItems) {
        partIds.push(item.partInfoId);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    }

    traverse(bomList);
    return partIds;
  }

  public openBomCostSummary() {
    this.modalRef = this.modalService.open(BomCostSummaryComponent, {
      windowClass: 'fullscreen bom-summary-model',
      // beforeDismiss: () => {
      //   console.log('beforeDismiss');
      //   return true; // use false to keep showing the modal
      // }
    });
    this.modalRef.componentInstance.inputData = {
      caller: 'bom-details',
      projectInfoId: this.currentProjectId,
      scenarioId: this.selectedScenario,
      bomTreeImages: this.bomTreeImages,
    };
    // modalRef.componentInstance.outputData.pipe(take(1)).subscribe((data) => !!featureData && this.callBk(data));
  }

  public openBomMove() {
    const modalRef = this.modalService.open(BomMoveComponent, {
      windowClass: 'bom-move-modal material-modal',
      // beforeDismiss: () => {
      //   console.log('beforeDismiss');
      //   return true; // use false to keep showing the modal
      // }
    });
    modalRef.componentInstance.inputData = {
      caller: 'bom-details',
      projectInfoId: this.currentProjectId,
      scenarioId: this.selectedScenario,
      bomTree: this.bomList,
      bomTreeImages: this.bomTreeImages,
      selectedPartInfoId: this.partId,
    };
    modalRef.componentInstance.outputData.pipe(take(1)).subscribe((data) => (this.isAnyMoveDone = data));
  }

  public addBomClick() {
    const dialogRef = this.addbomservice.openAddBomConfirmationDialog(<AddBomConfirmationDialogConfig>{
      data: {
        title: 'Add New Bom',
        message: '',
        showForm: true,
        projectInfoId: this.currentProjectId,
        partInfoId: this.partId,
        action: 'Confirm',
        cancelText: 'Cancel',
        origin: 'project-details',
      },
      panelClass: 'add-part-modal',
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      // else {
      //selectNewData(addBomDto: AddBomDto)
      // }
    });
  }

  public removeBomClick(bomId) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      } else {
        // const bomId = this.bomInfo?.bomId;
        // this._store.dispatch(new BomActions.RemoveBillOfMaterial(Number(bomId), this.currentProjectId, this.selectedScenario));
        this.bomInfoSignalsService.removeBillOfMaterial(Number(bomId), this.currentProjectId, this.selectedScenario);
        this.messaging.openSnackBar(`Data has been delete successfully.`, '', { duration: 5000 });
        console.log(bomId);
      }
    });
  }

  // dropScenario(event: CdkDragDrop<ProjectScenarioDto[]>) {
  //   const updatedList = [...this.scenarioList];
  //   moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
  //   this.scenarioList = updatedList;
  //   const orderedList = this.scenarioList.map((x, i) => ({ id: x.scenarioId, sortOrder: i }));
  //   console.log(orderedList); // send the orderedList to api
  // }

  ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
  }
}
