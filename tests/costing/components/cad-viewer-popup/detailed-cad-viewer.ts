import { environment } from 'src/environments/environment';

import cadex from '@cadexchanger/web-toolkit';
import { BaseViewer } from './Common/BaseViewer';
import { ViewerTools } from './Common/viewer-tools';
import { MCADPropertiesPanel } from './Common/mcad-properties-panel';
// import { MCADStructurePanel } from './Common/mcad-structure-panel';
import { MCADStructurePanel } from './Common/customized/mcad-structure-panel';
import { fetchFile } from './Common/helpers';
import { SectionPanel } from './Common/section-panel';
import { PMIPanel } from './Common/pmi-panel';
import { NotePanel } from './Common/notes-panel';
import { MeasurementPanel } from './Common/measurement-panel';
// import { SelectionHandlingPanel } from './Common/selection-handling-panel';
// import { SelectionHandling } from './Common/selection-handling';
import { MeasurementsManager, MeasurementMode } from './Common/MeasurementsManager';
import { DfmFeaturesLib } from './cad-viewer-lib/dfm-features-lib';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
// import { PartInfoDto } from 'src/app/shared/models';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';
import { takeUntil } from 'rxjs/operators';
import { BlockUiService } from 'src/app/shared/services';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../services/shared.service';
import { UserState } from 'src/app/modules/_state/user.state';
import { CommentFieldService } from 'src/app/shared/services/comment-field.service';
import { MachiningService } from 'src/app/modules/costing/services/machining.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { MachiningHelperService } from 'src/app/modules/costing/services/machining.helper.service';

declare const $: any;

export class DetailedCADViewer extends BaseViewer {
  viewerTools: any;
  structurePanel: any;
  propertiesPanel: any;
  clipPlaneManager: any;
  sectionPanel: any;
  pmiPanel: any;
  notePanel: any;
  // selectionHandlingPanel: SelectionHandlingPanel;
  // selectionHandling: SelectionHandling;
  measurementPanel: MeasurementPanel;
  measurementsManager: MeasurementsManager;
  _selectedPart: any;
  modelInfo: any;
  _selectedShapes: any;
  _processDataParts: any;
  _colorizedBodiesSceneNodes: any;
  _colorizedBodiesCollection: any;
  _selectionMode: any;
  _isModelUnfolded: any;
  currentSubjectL: any;
  userData: any;
  commodityId: number;
  projectId: number;
  partId: number;
  documentId: number;
  selectedShapeId: number;
  selectedCentroid: string;
  dfmFeaturesLib: DfmFeaturesLib;
  // _partInfo$: Observable<PartInfoDto>;
  userData$: Observable<{ [key: string]: any }>;
  // @Select(PartInfoState.getPartInfo) _partInfo$: Observable<PartInfoDto>;
  // @Select(UserState.getUser) userData$: Observable<{ [key: string]: any }>;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  propertiesSelectedEntities = {};
  pmiTreeLoaded = false;
  datumCentroid = null;
  isCtrlKeyPressed = false;
  lineOfLength = 0;

  constructor(
    private _blockUiService: BlockUiService,
    private partData: any,
    private passEntry: any,
    private modelService: NgbModal,
    private _sharedService: SharedService,
    private machiningHelperService: MachiningHelperService,
    private commentFieldService: CommentFieldService,
    private machiningService: MachiningService,
    public activeModal: NgbActiveModal,
    private _store: Store,
    private partInfoSignalsService: PartInfoSignalsService
  ) {
    super(document.getElementById('model-viewer'), {
      showViewCube: true,
      showLogo: false,
    });
    // this._partInfo$ = this._store.select(PartInfoState.getPartInfo);
    this.userData$ = this._store.select(UserState.getUser);

    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      this.userData = result;
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        this.isCtrlKeyPressed = true;
        console.log('Ctrl key is pressed inside document');
      }
    });

    document.addEventListener('keyup', (_event: KeyboardEvent) => {
      this.isCtrlKeyPressed = false;
      console.log('Ctrl key is relsease inside document');
    });

    this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Node; // other selection modes are edge, face, etc.

    // const bgCol = new cadex.ModelData_ColorObject(0, 1, 0, 1);
    // this.viewport.background = bgCol;

    // Setup viewer tools panel
    this.viewerTools = new ViewerTools({
      viewport: this.viewport,
    });

    /* Add highlighting model shapes on scene on hover: */
    this.viewport.inputManager.isHoverEnabled = true;
    // this.viewport.inputManager.pushInputHandler(new cadex.ModelPrs_HighlightingHandler(this.viewport));
    this.viewport.inputManager.pushInputHandler(new cadex.ModelPrs_HighlightingHandler());

    // this.dfmViewer = new Viewer(document.getElementById('dfm'));

    this.initializeModules();
    this.initializeVisibility();

    this.dfmFeaturesLib = new DfmFeaturesLib(this);
    if (this.partData?.caller !== 'manufacturing' && [3, 4, 5].includes(this.partData?.commodityId)) {
      this.viewerTools.domElement.appendChild(this.dfmFeaturesLib.getIconButtonSvg('show-datum'));
    }

    //------------------------sheet metal------------
    /** @type {CollectedPart} */
    //this._selectedPart = this._collectedParts[0];
    /** @type {Set<number>} */
    this._selectedShapes = new Set();
    /** @type {Array<ProcessDataPart>} */
    this._processDataParts = [];

    /** @type {Map<cadex.ModelData_Body, cadex.ModelPrs_SceneNode>} */
    this._colorizedBodiesSceneNodes = new Map();
    /* 'Feature group name' -> {body, ids, color} */
    /** @type {Map<string, Array<{body: cadex.ModelData_Body, ids: Array<number>, color: {r: number, g: number, b: number}}>>} */
    this._colorizedBodiesCollection = new Map();

    /** @type {cadex.ModelPrs_SelectionMode} */
    this._selectionMode = cadex.ModelPrs_SelectionMode.Face | cadex.ModelPrs_SelectionMode.Edge;

    this._isModelUnfolded = false;

    /* Add a handler for selection events from scene: */
    this.scene.selectionManager.addEventListener('selectionChanged', this.onSelectionChangedBySceneDFM.bind(this));

    /* Subscribe to a change in the value of the tree type selector and start loading and displaying the model again: */
    document.getElementsByName('treeTypeSelector-1').forEach((theRadioInputElement) => {
      // Selection between Features and DFM Analysis Tabs
      theRadioInputElement.addEventListener('change', async () => {
        if (!this.modelInfo) {
          // let modelname = JSON.parse(localStorage.getItem('modelJs'));
          let theModelInfoN;
          // let theProgressScopeN;
          this.currentSubjectL.subscribe((data) => {
            theModelInfoN = data?.theModelInfoN;
            // theProgressScopeN = data?.theProgressScopeN;
          });
          if (theModelInfoN) {
            // let baseExample = new BaseExample(new Basic3dViewer('file-viewer'));
            // baseExample.initModelSelector(modelname);
            // await this.loadAndDisplayModel(theModelInfoN, null, theProgressScopeN)
            await this.loadAndDisplayModel(theModelInfoN, null);
          } else {
            console.log('model name is null', theModelInfoN);
          }
        } else {
          // trigger only the dfm tree
          const aPartsSelector = /** @type {HTMLSelectElement} */ document.querySelector('.part-selector-1');
          if (aPartsSelector) {
            await this.onSelectedPartChange(aPartsSelector);
          }
        }
      });
    });
  }

  initializeModules() {
    this.pmiPanel = new PMIPanel(
      {
        domElement: document.getElementById('pmi-panel'),
      },
      this.scene,
      this.viewport
    );

    this.structurePanel = new MCADStructurePanel({
      scene: this.scene,
      modelSceneNode: this.modelSceneNode,
      viewport: this.viewport,
      domElement: document.getElementById('structure-panel'),
    });

    /** Measurement - Begin */
    this.measurementPanel = new MeasurementPanel(
      {
        domElement: document.getElementById('measurements-panel'),
      },
      this.scene,
      this.viewport
    );
    this.measurementsManager = new MeasurementsManager(this.scene);
    this.viewport.inputManager.pushInputHandler(this.measurementsManager);
    this.measurementsManager.isActivate = true;

    this.scene.addEventListener('boundingBoxChanged', () => {
      this.measurementsManager.fontSize = Math.max(this.scene.boundingBox.xRange(), this.scene.boundingBox.yRange(), this.scene.boundingBox.zRange()) / 30;
    });
    const measurementSetup = () => {
      const aMeasurementsModeSelector = document.querySelector<HTMLElement>('#measurements-mode-selector')!;
      const aMeasurementsModeSelect = aMeasurementsModeSelector.querySelector<HTMLSelectElement>('select')!;
      const onMeasurementModeChanged = () => {
        const aMeasurementMode = MeasurementMode[aMeasurementsModeSelect.value];
        this.measurementsManager.measurementMode = aMeasurementMode;
        aMeasurementsModeSelector.dataset.measurementMode = aMeasurementsModeSelect.value;
        this.modelSelectionMode =
          aMeasurementMode === MeasurementMode.Distance
            ? cadex.ModelPrs_SelectionMode.Vertex | cadex.ModelPrs_SelectionMode.Edge | cadex.ModelPrs_SelectionMode.Face | cadex.ModelPrs_SelectionMode.PolyVertex
            : cadex.ModelPrs_SelectionMode.Vertex | cadex.ModelPrs_SelectionMode.PolyVertex;
      };
      aMeasurementsModeSelect.onchange = onMeasurementModeChanged;
      onMeasurementModeChanged();
      const aLengthUnitsSelect = document.querySelector<HTMLSelectElement>('#length-units-selector>select')!;
      Object.keys(cadex.Base_LengthUnit).forEach((theName) => {
        const anOption = document.createElement('option');
        anOption.text = theName.split('_').pop(); // (theName.match(/.*_([^_]+$)/) as RegExpMatchArray)[1];
        anOption.value = `${cadex.Base_LengthUnit[theName]}`;
        aLengthUnitsSelect.add(anOption);
      });
      aLengthUnitsSelect.value = `${this.measurementsManager.lengthUnit}`;
      aLengthUnitsSelect.onchange = () => {
        this.measurementsManager.lengthUnit = parseInt(aLengthUnitsSelect.value);
      };

      const anAngleUnitsSelect = document.querySelector<HTMLSelectElement>('#angle-units-selector>select')!;
      Object.keys(cadex.Base_AngleUnit).forEach((theName) => {
        const anOption = document.createElement('option');
        anOption.text = theName?.split('_').pop(); // (theName.match(/.*_([^_]+$)/) as RegExpMatchArray)[1];
        anOption.value = cadex.Base_AngleUnit[theName];
        anAngleUnitsSelect.add(anOption);
      });
      anAngleUnitsSelect.value = `${this.measurementsManager.angleUnit}`;
      anAngleUnitsSelect.onchange = () => {
        this.measurementsManager.angleUnit = parseInt(anAngleUnitsSelect.value);
      };
    };
    measurementSetup();
    /** Measurement - End */

    this.propertiesPanel = new MCADPropertiesPanel({
      domElement: document.getElementById('properties-panel'),
    });

    this.sectionPanel = new SectionPanel(
      {
        domElement: document.getElementById('section-panel'),
      },
      this.scene,
      this.viewport
    );

    this.notePanel = new NotePanel(
      {
        domElement: document.getElementById('note-panel'),
      },
      this.scene,
      this.viewport,
      this.commentFieldService
    );

    /** ExpCustom - Selectionhandling - Begin */
    // this.selectionHandlingPanel = new SelectionHandlingPanel({
    //   domElement: (document.getElementById('selection-handling-panel')),
    // }, this.scene, this.viewport);
    // // // Enables context menu handling
    // // const aContextMenuHandler = new ContextMenuHandler(this.scene);
    // // this.viewport.inputManager.pushInputHandler(aContextMenuHandler);

    // this.selectionHandling = new SelectionHandling();
    // // Subscribe to selection changed events
    // // this.scene.selectionManager.addEventListener('selectionChanged', this.selectionHandling.onSelectionChanged.bind(this));

    // const aSelectionModeSelector = document.querySelector('#selection-mode-selector>select') as HTMLSelectElement;
    // const onSelectionModeChanged = () => {
    //   this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode[aSelectionModeSelector.value];
    //   this.propertiesSelectedEntities = {};
    //   this.propertiesPanData('SelectedEntities');
    //   this.scene.update();
    // };
    // aSelectionModeSelector.onchange = onSelectionModeChanged;
    // // onSelectionModeChanged();
    /** ExpCustom - Selectionhandling - End */
  }

  initializeVisibility() {
    const dfmPanel = document.getElementById('viewer-container-1');
    const hideAll = (except = '') => {
      except !== 'section' && this.sectionPanel.hide();
      except !== 'pmi' && this.pmiPanel.hide();
      // (except !== 'selectionHandling') && this.selectionHandlingPanel.hide();
      except !== 'note' && this.notePanel.hide();
      except !== 'properties' && this.propertiesPanel.hide();
      except !== 'measurement' && this.measurementPanel.hide();
      if (except !== 'dfm') {
        dfmPanel.style.display = 'none';
        this.viewerTools.dfmButtonActive = false;
      }
    };

    document.getElementById('error-notification').style.display = 'none';
    document.getElementById('help-section').style.display = 'none';
    document.getElementById('help-pmi').style.display = 'none';
    document.getElementById('help-dfm').style.display = 'none';
    document.getElementById('help-notes').style.display = 'none';
    document.getElementById('help-properties').style.display = 'none';
    document.getElementById('help-measurement').style.display = 'none';
    hideAll();

    this.structurePanel.show();
    this.viewerTools.structureButtonActive = true;

    if (['material', 'manufacturing', 'dfm'].includes(this.partData.caller)) {
      dfmPanel.style.display = 'block';
      this.viewerTools.dfmButtonActive = true;
      document.getElementById('help-dfm').style.display = 'block';
    } else {
      // supporting-documents or bom-details or null
      this.measurementPanel.show();
      this.viewerTools.measurementButtonActive = true;
      document.getElementById('help-measurement').style.display = 'block';
    }

    this.viewerTools.addEventListener('dfmButtonActiveChanged', () => {
      if (this.viewerTools.dfmButtonActive) {
        hideAll('dfm');
        dfmPanel.style.display = 'block';
        document.getElementById('help-dfm').style.display = 'block';
        !this.viewerTools.pmiButtonActive && this.structureTreeCheckUncheck(false);
      } else {
        dfmPanel.style.display = 'none';
        document.getElementById('help-dfm').style.display = 'none';
        !this.viewerTools.pmiButtonActive && this.structureTreeCheckUncheck(true);
      }
      const aPartsSelector = document.querySelector('.part-selector-1');
      if (aPartsSelector) {
        this.onSelectedPartChange(aPartsSelector);
      }
    });

    this.viewerTools.addEventListener('structureButtonActiveChanged', () => {
      if (this.viewerTools.structureButtonActive) {
        this.structurePanel.show();
      } else {
        this.structurePanel.hide();
      }
    });

    this.viewerTools.addEventListener('propertiesButtonActiveChanged', () => {
      if (this.viewerTools.propertiesButtonActive) {
        hideAll('properties');
        this.propertiesPanel.show();
        // this.propertiesPanData('properties');
        document.getElementById('help-properties').style.display = 'block';
        // (document.querySelector('.structure-panel__tree ul.jstree-container-ul').querySelector('li a[href="#"]') as HTMLElement).click(); // select the root node & call the propertiesPanData
        const liA = document.querySelector('.structure-panel__tree ul.jstree-container-ul')?.querySelector('li a[href="#"]');
        liA instanceof HTMLElement && liA.click();
      } else {
        this.propertiesPanel.hide();
        document.getElementById('help-properties').style.display = 'none';
      }
    });

    this.viewerTools.addEventListener('sectioningButtonActiveChanged', () => {
      if (this.viewerTools.sectioningButtonActive) {
        hideAll('section');
        this.sectionPanel.show();
        document.getElementById('help-section').style.display = 'block';
      } else {
        this.sectionPanel.hide();
        document.getElementById('help-section').style.display = 'none';
      }
    });

    this.viewerTools.addEventListener('pmiButtonActiveChanged', async () => {
      if (this.viewerTools.pmiButtonActive) {
        hideAll('pmi');
        // if (!this.pmiTreeLoaded) {
        //   const aProgressScope = this.progressStatusManager.init().rootScope;
        //   await this.structurePanel.loadPMIModel(this.model, this.modelInfo.modelName, new cadex.Base_ProgressScope(aProgressScope, 100)); // load PMI tree
        //   this.pmiTreeLoaded = true;
        // }
        this.pmiPanel.show();
        document.getElementById('help-pmi').style.display = 'block';
        // $('.structure-panel__tree > ul > li:first-child').addClass('hidden');
        // $('.structure-panel__tree > ul > li:nth-child(2)').removeClass('hidden'); // show pmi tree
        // $('.structure-panel__tree > ul > li:nth-child(2) .jstree-sge-state ').css('display', 'none'); // hide checkbox for pmi tree
        this.structureTreeCheckUncheck(true);
        $('.structure-panel__tree > ul > li .jstree-sge-state ').css('display', 'none'); // hide checkbox for pmi tree
      } else {
        this.pmiPanel.hide();
        // const aProgressScope = this.progressStatusManager.init().rootScope;
        // await this.structurePanel.loadModel(this.model, this.modelInfo.modelName, new cadex.Base_ProgressScope(aProgressScope, 5)); // load structure tree
        document.getElementById('help-pmi').style.display = 'none';
        // $('.structure-panel__tree > ul > li:first-child').removeClass('hidden'); // show structure tree
        // $('.structure-panel__tree > ul > li:nth-child(2)').addClass('hidden');
        // $('.structure-panel__tree > ul > li:nth-child(2) .jstree-sge-state ').css('display', 'show'); // show checkbox for structure tree
        $('.structure-panel__tree > ul > li .jstree-sge-state ').css('display', 'inline-block'); // show checkbox for pmi tree
      }
    });

    // this.viewerTools.addEventListener('selectionHandlingButtonActiveChanged', () => {
    //   if (this.viewerTools.selectionHandlingButtonActive) {
    //     hideAll('selectionHandling');
    //     this.selectionHandlingPanel.show();
    //     // Reset the selection to Solid
    //     this.selectionHandling.loadAndDisplayModel(this.hasBRepRep);
    //   } else {
    //     this.selectionHandlingPanel.hide();
    //     this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Node | cadex.ModelPrs_SelectionMode.Vertex | cadex.ModelPrs_SelectionMode.PolyVertex;
    //     this.scene.update();
    //   }
    // });

    this.viewerTools.addEventListener('noteButtonActiveChanged', () => {
      if (this.viewerTools.noteButtonActive) {
        hideAll('note');
        this.notePanel.show();
        document.getElementById('help-notes').style.display = 'block';
      } else {
        this.notePanel.hide();
        document.getElementById('help-notes').style.display = 'none';
      }
    });

    this.viewerTools.addEventListener('measurementButtonActiveChanged', () => {
      if (this.viewerTools.measurementButtonActive) {
        hideAll('measurement');
        this.measurementPanel.show();
        this.measurementsManager.isActivate = true;
        document.getElementById('help-measurement').style.display = 'block';
        this.measurementsManager.showAllMeasurements();
      } else {
        this.measurementPanel.hide();
        this.measurementsManager.hideAllMeasurements();
        this.measurementsManager.isActivate = false;
        document.getElementById('help-measurement').style.display = 'none';
      }
    });

    this.viewerTools.addEventListener('displayModeChanged', () => {
      // display mode options
      this.modelSceneNode.displayMode = this.viewerTools.displayMode;
      this.scene.update();
    });

    // Update UI theme
    // this.viewerTools.addEventListener('themeChanged', () => {
    //   document.documentElement.dataset.theme = this.viewerTools.theme;
    // });

    // Load properties of selected model elements.
    this.structurePanel.addEventListener('selectionChanged', () => {
      this.viewerTools.propertiesButtonActive && this.propertiesPanData('properties');
      // await this.pmiPanel.loadElements(this.structurePanel.selectedSceneGraphElements(), this.scene, this.viewport);
    });

    this.structurePanel.addEventListener('hide', () => {
      this.viewerTools.structureButtonActive = false;
    });
    this.pmiPanel.addEventListener('hide', () => {
      this.viewerTools.pmiButtonActive = false;
    });
    // this.selectionHandlingPanel.addEventListener('hide', () => { this.viewerTools.selectionHandlingButtonActive = false; });
    this.sectionPanel.addEventListener('hide', () => {
      this.viewerTools.sectioningButtonActive = false;
    });
    this.notePanel.addEventListener('hide', () => {
      this.viewerTools.noteButtonActive = false;
    });
    this.measurementPanel.addEventListener('hide', () => {
      this.viewerTools.measurementButtonActive = false;
    });
    this.propertiesPanel.addEventListener('hide', () => {
      this.viewerTools.propertiesButtonActive = false;
    });
  }

  /** ExpCustom - BEGIN Properties Pane Update */

  roundOf(value = 0, digits = 0) {
    const roundedVal = Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
    const splitedVal = roundedVal?.toString()?.split('.');
    splitedVal[0] = new Intl.NumberFormat('en-US').format(Number(splitedVal[0])); // splitedVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return splitedVal.join('.');
  }

  structureTreeCheckUncheck = (check = true) => {
    const ulElement = document.querySelector('.structure-panel__tree ul.jstree-container-ul'); // structure tree ul
    const ulIElementSelected = ulElement.querySelector('li a.jstree-displayed[href="#"] i.jstree-sge-state:first-child'); // structure tree ul li checkbox - selected
    const ulIElementClickable = ulElement.querySelector('li a[href="#"] i.jstree-sge-state:first-child'); // structure tree ul li checkbox - unselected
    if (check) {
      !ulIElementSelected && ulIElementClickable instanceof HTMLElement && ulIElementClickable.click(); // check the unchecked root node
    } else {
      ulIElementSelected && ulIElementClickable instanceof HTMLElement && ulIElementClickable.click(); // uncheck the root node
    }
  };

  async propertiesPanData(panel = 'properties') {
    // if (panel === 'properties' && this.partData) {
    const selectedElements = this.structurePanel.selectedSceneGraphElements();
    if (!!selectedElements && selectedElements?.length > 0) {
      await this.propertiesPanel.loadElements(selectedElements); // clear and load basic properties
    } else {
      await this.propertiesPanel.clear();
    }
    const [isEnableUnitConversion, conversionValue] = this._sharedService.getUnitMeasurement();
    // Custom Properties
    this.propertiesPanel._panelBody.appendChild(
      this.propertiesPanel.createPropertiesGroup('Part Bounding Box', {
        ['Length (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.dimentions.dimX, conversionValue, isEnableUnitConversion), 2),
        ['Width (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.dimentions.dimY, conversionValue, isEnableUnitConversion), 2),
        ['Height (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.dimentions.dimZ, conversionValue, isEnableUnitConversion), 2),
      })
    );
    let forgingParams = {};
    if (this.commodityId === 5 && !!this.partData?.filledVolume && !!this.partData?.filledSurfaceArea) {
      // 5 - Forging/metal-forming
      forgingParams = {
        ['Filled Volume (' + conversionValue + '^3):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.filledVolume, conversionValue, isEnableUnitConversion), 3),
        ['Filled Surface Area (' + conversionValue + '^2):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.filledSurfaceArea, conversionValue, isEnableUnitConversion), 3),
      };
    }
    this.propertiesPanel._panelBody.appendChild(
      this.propertiesPanel.createPropertiesGroup('Part Geometry', {
        ['Volume (' + conversionValue + '^3):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.volume, conversionValue, isEnableUnitConversion), 3),
        ['Surface Area (' + conversionValue + '^2):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.surfaceArea, conversionValue, isEnableUnitConversion), 3),
        ['Projected Area (' + conversionValue + '^2):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.projectedArea, conversionValue, isEnableUnitConversion), 3),
        ['Center of Mass X (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.centerMass.centroidX, conversionValue, isEnableUnitConversion), 2),
        ['Center of Mass Y (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.centerMass.centroidY, conversionValue, isEnableUnitConversion), 2),
        ['Center of Mass Z (' + conversionValue + '):']: this.roundOf(this._sharedService.convertUomInUI(this.partData.centerMass.centroidZ, conversionValue, isEnableUnitConversion), 2),
        ...forgingParams,
      })
    );
    // } else
    if (panel === 'SelectedEntities') {
      setTimeout(() => {
        /** In Properties panel */
        Object.keys(this.propertiesSelectedEntities).length > 0 &&
          this.propertiesPanel._panelBody.appendChild(this.propertiesPanel.createPropertiesGroup('Selected Entity Details:', this.propertiesSelectedEntities));
        const propertiesPanelBody = document.getElementById('properties-panel').querySelector('div.properties-panel__body');
        propertiesPanelBody.scrollTop = propertiesPanelBody.scrollHeight; // scroll to bottom
      }, 100);
      /** In selection handling panel */
      // Object.keys(this.propertiesSelectedEntities).length > 0 && this.selectionHandlingPanel.updateContent(this.propertiesPanel.createPropertiesGroup('', this.propertiesSelectedEntities));
      // Object.keys(this.propertiesSelectedEntities).length <= 0 && this.selectionHandlingPanel.updateContent();
    }
  }
  /** ExpCustom - END Properties Pane Update */

  /**
   * @override
   * @param {cadex.Base_ProgressScope} theProgressScope
   */
  async clear(theProgressScope) {
    //ExpCustom - Begin
    this.measurementsManager.removeAllMeasurements();
    this.structurePanel.clear();
    await this.propertiesPanel.clear();
    //ExpCustom - End
    return super.clear(theProgressScope);
  }

  /**
   * @override
   * @param {ModelInfo} theModelInfo
   * @param {cadex.ModelData_ExternalDataProvider} dataProvider
   * @param {cadex.Base_ProgressScope} theProgressScope
   */
  async loadAndDisplayModel(theModelInfo, dataProvider) {
    this._blockUiService.pushBlockUI('loadAndDisplayModel');
    this.modelInfo = theModelInfo;
    this.notePanel.notesManager.partInfoId = this.partData.partId;
    // const aProgressScope = new cadex.Base_ProgressScope(theProgressScope);
    const aProgressScope = this.progressStatusManager.init().rootScope;
    try {
      const aCustomDataProvider: cadex.ModelData_ExternalDataProvider = (theFileName, theProgressScope) => {
        return fetchFile(`${environment.apiUrl}/api/costing/CadExtractor/${encodeURIComponent(theModelInfo.modelName)}/Model/${encodeURIComponent(theFileName)}`, theProgressScope, this.userData);
      };

      await this.clear(new cadex.Base_ProgressScope(aProgressScope, 1));
      if (dataProvider) {
        await this.loadModel(theModelInfo.filename, dataProvider, new cadex.Base_ProgressScope(aProgressScope, 5));
      } else {
        await this.loadModel('scenegraph.cdxfb', aCustomDataProvider, new cadex.Base_ProgressScope(aProgressScope, 5));
      }

      if (theModelInfo.comparePartId) {
        this.viewerTools.displayMode = cadex.ModelPrs_DisplayMode.Shaded;
      } else {
        this.viewerTools.displayMode = this.hasBRepRep ? cadex.ModelPrs_DisplayMode.ShadedWithBoundaries : cadex.ModelPrs_DisplayMode.Shaded;
      }
      this.modelSceneNode.displayMode = this.viewerTools.displayMode;

      this.structurePanel.representationMask = this.hasBRepRep ? cadex.ModelData_RepresentationMask.ModelData_RM_BRep : cadex.ModelData_RepresentationMask.ModelData_RM_Poly;
      // await this.structurePanel.loadModel(this.model, theModelInfo.modelName, new cadex.Base_ProgressScope(aProgressScope, 5));
      await this.structurePanel.loadPMIModel(this.model, this.modelInfo.modelName, new cadex.Base_ProgressScope(aProgressScope, 100)); // load tree

      // Update scene to apply changes.
      await this.updateSceneSmoothly(new cadex.Base_ProgressScope(aProgressScope));

      // Finally move camera to position when the whole model is in sight
      this.viewport.fitAll(5);

      //--------------------Sheet metal viewer---------------
      const modelJsFile = {
        theModelInfoN: theModelInfo,
        // theProgressScopeN: theProgressScope
      };
      this.currentSubjectL = new BehaviorSubject(modelJsFile);
      // this._partInfo$.pipe(take(1)).subscribe(async (result: PartInfoDto) => {
      // console.log(result);
      const result = this.partInfoSignalsService.partInfo();
      this._processDataParts = [];
      this.commodityId = result?.commodityId;
      this.partId = result?.partInfoId;
      this.projectId = result?.partInfoId;
      this.documentId = result?.documentCollectionId;
      result?.documentCollectionDto?.documentRecords?.length > 0 &&
        result?.documentCollectionDto?.documentRecords.forEach((item, i) => {
          if (!!result?.documentCollectionDto?.documentRecords[i]?.imageJson && this._processDataParts?.length === 0) {
            this._processDataParts = JSON.parse(result?.documentCollectionDto?.documentRecords[i]?.imageJson || '');
            console.log(this._processDataParts);
          }
        });
      // if (this._processDataParts && this._processDataParts !== '' && this._processDataParts?.length !== 0) {
      if (this._collectedParts && this._collectedParts?.length > 0) {
        this._selectedPart = this._collectedParts[0];
        /* Form and show model parts selector: */
        this.initPartsSelector(
          this._collectedParts.reduce((prev, curr) => {
            prev?.push(curr?.label);
            return prev;
          }, []),
          this._selectedPart?.label
        );

        const aPartsSelector = /** @type {HTMLSelectElement} */ document.querySelector('.part-selector-1');
        if (aPartsSelector) {
          await this.onSelectedPartChange(aPartsSelector);
        }
      }
      // });
      this._blockUiService.popBlockUI('loadAndDisplayModel');
    } catch (theErr) {
      console.warn(`Unable to load and display model "${theModelInfo.modelName}"`, theErr);
      this._blockUiService.popBlockUI('loadAndDisplayModel');
      if (theModelInfo.filename !== 'scenegraph.cdxfb') {
        theModelInfo.filename = 'scenegraph.cdxfb';
        await this.loadAndDisplayModel(theModelInfo, dataProvider);
      }
    } finally {
      aProgressScope.close();
    }
  }

  initPartsSelector(theParts, theDefaultValue) {
    /* Clean up the previous selector: */
    const aPreviousPartsSelector = document.querySelector('.part-selector-1');
    if (aPreviousPartsSelector) {
      aPreviousPartsSelector.remove();
    }

    // const anExampleContainer = document.getElementById('example-container-1');
    const anExampleContainer = document.getElementById('tree-view-panel-1');
    if (!anExampleContainer) {
      return;
    }

    const aPartsSelector = document.createElement('select'); // small dropdown appearing below the feature selection dropdown in DFM panel
    aPartsSelector.classList.add('part-selector-1');
    theParts.forEach((thePart) => {
      const anOption = document.createElement('option');
      anOption.value = thePart;
      anOption.text = thePart;
      if (thePart === theDefaultValue) {
        anOption.setAttribute('selected', 'true');
      }
      aPartsSelector.appendChild(anOption);
    });

    aPartsSelector.addEventListener('change', async (theEvent) => {
      await this.onSelectedPartChange(/** @type {HTMLSelectElement} */ theEvent.target);
    });

    anExampleContainer.appendChild(aPartsSelector);
  }

  async onSelectedPartChange(theElement) {
    /* Clean up scene to display new part: */
    await this.removeRootPart();

    /* Clear bodies and bodies scene nodes collections for every part change: */
    this._colorizedBodiesCollection.clear();
    this._colorizedBodiesSceneNodes.clear();

    /* Clean up the previous DFM features tree: */
    const aPrevTreeElement = document.querySelector('.tree-view-panel-1 details');
    if (aPrevTreeElement) {
      aPrevTreeElement.remove();
    }
    /* Clean up the unfolded features tab if exists: */
    const anUnfoldedFeaturesTab = document.querySelector('.tree-view-panel-1 .unfolded-features');
    if (anUnfoldedFeaturesTab) {
      anUnfoldedFeaturesTab.remove();
    }
    /* Clean up error message if exists: */
    const anErrorMessageElement = document.querySelector('.tree-view-panel-1 .error-message');
    if (anErrorMessageElement) {
      anErrorMessageElement.remove();
    }
    /* Clean up the previous selector: */
    const aPreviousFeatureSelector = document.querySelector('.features-selector-1');
    if (aPreviousFeatureSelector) {
      aPreviousFeatureSelector.remove();
    }
    /* Clean up the previous export JSON button: */
    const aPreviousExportJSONButton = document.querySelector('.export-json-button');
    if (aPreviousExportJSONButton) {
      aPreviousExportJSONButton.remove();
    }

    this._selectedPart = this._collectedParts.find((theCollectedPart) => theCollectedPart?.label === theElement.value);
    const selectedIndex = this._collectedParts.findIndex((theCollectedPart) => theCollectedPart?.label === theElement.value);
    const aProcessDataPart = this._processDataParts?.parts && this._processDataParts?.parts[selectedIndex];
    if (!aProcessDataPart) {
      const aTreeViewPanel = document.querySelector('.tree-view-panel-1');
      const anErrorMessageElement = document.createElement('div');
      anErrorMessageElement.classList.add('error-message');
      anErrorMessageElement.innerHTML = `Unable to find part data for ${this._selectedPart.label}`;
      aTreeViewPanel.appendChild(anErrorMessageElement);
      // console.error(`Unable to find part data for [${this._selectedPart.label}]`);
      return;
    }

    const isFeaturesTreeSelected = /** @type {HTMLLabelElement} */ (document.querySelector('.tree-type-selector-1 input:checked + label') as HTMLLabelElement).innerText === 'Features';

    const aColorizedFeatureGroups =
      (isFeaturesTreeSelected
        ? this._isModelUnfolded
          ? []
          : aProcessDataPart?.featureRecognition?.featureGroups
        : this._isModelUnfolded
          ? aProcessDataPart?.dfmUnfolded?.featureGroups
          : aProcessDataPart?.dfm?.featureGroups) || [];

    /* Form and show features selector: */
    await this.initFeaturesSelector(aColorizedFeatureGroups);

    /* Recognize the choice of tree view panel type through the label of the selected radio input: */
    if (isFeaturesTreeSelected) {
      // Form and show the right panel of the Features tree
      this.initFeaturesTree(aProcessDataPart, this._selectedPart.label);
    } else {
      // Form and show the right panel of the DFM features tree
      this.initDFMTree(aProcessDataPart, this._selectedPart.label);
    }

    //this.initExportJSON();

    /* If there is situation when <model_name>_unfolded.cdxweb is not generated: */
    // const aShowEmptyUnfoldedModel = this._isModelUnfolded ? !(await isUnfoldedModelExists(this.modelInfo.fileName)) : false;

    // if (!false) {
    await this.addRootPart(this._selectedPart.sge, this._selectionMode);

    const aBRepRepresentation = this._selectedPart.representation instanceof cadex.ModelData_BRepRepresentation ? this._selectedPart.representation : this._selectedPart.sge.brepRepresentation();

    if (aBRepRepresentation) {
      /* Collect and colorize target bodies. */
      for (const theFeatureGroup of aColorizedFeatureGroups) {
        const collectedShapesIDs = collectShapesIDs(theFeatureGroup);
        const aColorizedShapes = await this.getShapes(aBRepRepresentation, collectedShapesIDs.ids);

        if (aColorizedShapes) {
          const aShapesTypes = new Set();
          /* Get shape types: */
          aColorizedShapes.forEach((theShape) => aShapesTypes.add(theShape.type));

          /** @type {Map<cadex.ModelData_Body, Array<number>>} */
          const aColorizedBodies = new Map();

          for (const aType of aShapesTypes) {
            /* Get the shapes by type: */
            const aTypedShapes = aColorizedShapes.filter((theShape) => theShape.type === aType);
            /** @type {Set<number>} */
            const aTypedShapesIDs = new Set();
            /* Get the own id's for the typed shapes:*/
            aTypedShapes.forEach((theShape) => {
              const aShapeID = aBRepRepresentation.shapeId(theShape);
              if (aShapeID !== -1) {
                aTypedShapesIDs.add(aShapeID);
              }
            });

            /* Form a body from type-specific shapes: */
            const aColorizedBody = await this.formBody(aTypedShapes);
            if (aColorizedBody) {
              aColorizedBodies.set(aColorizedBody, Array.from(aTypedShapesIDs));
            }
          }

          /* Fill the bodies collection with bodies and them own id's: */
          this._colorizedBodiesCollection.set(
            theFeatureGroup.name,
            Array.from(aColorizedBodies).map((theBody) => ({ body: theBody[0], ids: theBody[1], color: collectedShapesIDs.color }))
          );

          for (const aColorizedBody of aColorizedBodies.keys()) {
            const aBodySceneNode = await this.addBodyToRootPart(aColorizedBody, collectedShapesIDs.color);
            if (aBodySceneNode) {
              this._colorizedBodiesSceneNodes.set(aColorizedBody, aBodySceneNode);
            }
          }
        }
      }

      /* Shade all other representation shapes: */
      const aColorizedShapesIDs = Array.from(this._colorizedBodiesCollection.values()).reduce(
        (thePrev: any, theCurr: any) => {
          theCurr.forEach((theBodiesCollectionElement) => theBodiesCollectionElement.ids.forEach((theID) => thePrev.push(theID)));
          return thePrev;
        },
        /** @type {Array<number>} */ []
      );
      await this.shadeAllRepresentationShapes(aBRepRepresentation, aColorizedShapesIDs);
    }
    // }
  }

  async getShapes(theRepresentation, theShapesIDs) {
    /* Flush providers for filling representation with shapes: */
    await theRepresentation.bodyList();

    try {
      const aShapes = [];
      theShapesIDs.forEach((theShapeID) => {
        const aShape = theRepresentation.shape(theShapeID);
        if (aShape) {
          aShapes.push(aShape);
        }
      });

      return aShapes;
    } catch (theErr) {
      console.error(`Unable to get shapes [${/** @type {Error} */ theErr}]`);
      return null;
    }
  }

  async shadeAllRepresentationShapes(theRepresentation, theExclusionIDS) {
    try {
      const anAllRepresentationBodies = await theRepresentation.bodyList();
      const aShadedFaces = [];
      /* Get all shapes excluding painted shapes: */
      for (const aBody of anAllRepresentationBodies) {
        for (const aShape of new cadex.ModelData_ShapeIterator(aBody, cadex.ModelData_ShapeType.Face)) {
          if (!theExclusionIDS.includes(theRepresentation.shapeId(aShape))) {
            aShadedFaces.push(aShape);
          }
        }
      }

      const aShadedBodyForFaces = await this.formBody(aShadedFaces);
      if (aShadedBodyForFaces) {
        const aShadedBodySceneNodeForFaces = await this.addBodyToRootPart(aShadedBodyForFaces, '');
        if (aShadedBodySceneNodeForFaces) {
          /* Set ghostly hidden visibility mod: */
          aShadedBodySceneNodeForFaces.displayMode = cadex.ModelPrs_DisplayMode.ShadedWithBoundaries;
          if (this.commodityId === 4) {
            // stock machining (dual modal feature comparison)
            aShadedBodySceneNodeForFaces.visibilityMode = cadex.ModelPrs_VisibilityMode.Visible;
          } else {
            aShadedBodySceneNodeForFaces.visibilityMode =
              document.getElementById('help-dfm').style.display === 'none' ? cadex.ModelPrs_VisibilityMode.Hidden : cadex.ModelPrs_VisibilityMode.GhostlyHidden;
          }
          /* Customize color of ghostly hidden appearance: */
          const aColorizedGhostStyle = new cadex.ModelPrs_Style();
          aColorizedGhostStyle.ghostModeAppearance = new cadex.ModelData_Appearance(new cadex.ModelData_ColorObject(0.82, 0.82, 0.82, 0.6));
          aShadedBodySceneNodeForFaces.style = aColorizedGhostStyle;
          /* Update the scene to see visualization changes: */
          this.scene.update();
        }
      }
    } catch (theErr) {
      console.error(`Unable to shade all representation shapes [${/** @type {Error} */ theErr}]`);
    }
  }

  onSelectionChangedBySceneDFM(theEvent) {
    this._blockUiService.pushBlockUI('onSelectionChangedBySceneDFM');
    /* Get a B-Rep representation of selected part: */
    const aBrepRep = this._selectedPart?.representation instanceof cadex.ModelData_BRepRepresentation ? this._selectedPart?.representation : this._selectedPart?.sge?.brepRepresentation();
    /* Shape selection is only available for BRep representation: */
    if (aBrepRep) {
      // console.log('Shape cannot be selected: The representation of the selected part is not a BRep.');
      //  alert('Shape cannot be selected: The representation of the selected part is not a BRep.');
      //   return;
      // }

      /* For each unselected shape in the scene: */
      if (theEvent.removed.length > 0) {
        theEvent.removed.forEach((theSelectionItem) => {
          const aSelectedEntityVisitor = new SelectedEntityVisitor();
          for (const anEntity of theSelectionItem.entities()) {
            /* Fill the SelectedEntityVisitor selected shapes collection. */
            anEntity.accept(aSelectedEntityVisitor);
          }
          aSelectedEntityVisitor.selectedShapes.forEach((theSelectedShape) => {
            const aShapeID = aBrepRep.shapeId(theSelectedShape);
            /* Remove shape from the selected shapes collection: */
            this._selectedShapes.delete(aShapeID);
          });
        });
      }
      let currentShapeID = '';
      /* For each selected shape in the scene: */
      if (theEvent.added.length > 0) {
        theEvent.added.forEach((theSelectionItem) => {
          const aSelectedEntityVisitor = new SelectedEntityVisitor();
          for (const anEntity of theSelectionItem.entities()) {
            /* Fill the SelectedEntityVisitor selected shapes collection. */
            anEntity.accept(aSelectedEntityVisitor);
          }

          aSelectedEntityVisitor.selectedShapes.forEach((theSelectedShape) => {
            /** ExpCustom - BEGIN Properties Pane Update */
            // this.propertiesSelectedEntities = (theEvent.added.length > 0 && theEvent.removed.length > 0) ? {} : this.propertiesSelectedEntities;
            // const propertyIndex = Object.keys(this.propertiesSelectedEntities).length + 1;
            this.propertiesSelectedEntities = {};
            let propertyIndex = 1;

            const surfaceAreaVal = cadex.ModelAlgo_ValidationProperty.computeShapeSurfaceArea(theSelectedShape);
            const boundingBoxVal = cadex.ModelAlgo_BoundingBox.computeShapeBoundingBox(theSelectedShape);
            const volumeVal = boundingBoxVal.xRange() * boundingBoxVal.yRange() * boundingBoxVal.zRange();
            const boundingBoxArr = [boundingBoxVal.xRange(), boundingBoxVal.yRange(), boundingBoxVal.zRange()].sort((a, b) => b - a); // max is length & min is height

            const curveLen = new cadex.ModelAlgo_CurveLength();
            const lengthVal = curveLen.computeEdgeLength(theSelectedShape);

            const [isEnableUnitConversion, conversionValue] = this._sharedService.getUnitMeasurement();

            if (theSelectedShape.type === cadex.ModelData_ShapeType.Edge) {
              if (this.isCtrlKeyPressed) {
                this.lineOfLength += this._sharedService.convertUomInUI(lengthVal, conversionValue, isEnableUnitConversion);
                this.propertiesSelectedEntities[propertyIndex++ + '. Total Length of Line (' + conversionValue + '): '] = this.roundOf(this.lineOfLength, 3);
              } else {
                this.lineOfLength = this._sharedService.convertUomInUI(lengthVal, conversionValue, isEnableUnitConversion);
                this.propertiesSelectedEntities[propertyIndex++ + '. Length of Line (' + conversionValue + '): '] = this.roundOf(this.lineOfLength, 3);
              }
            } else if ([cadex.ModelData_ShapeType.Solid, cadex.ModelData_ShapeType.Shell, cadex.ModelData_ShapeType.Face].includes(theSelectedShape.type)) {
              this.lineOfLength = 0;
              if (surfaceAreaVal >= 0.001)
                this.propertiesSelectedEntities[propertyIndex++ + '. Surface Area (' + conversionValue + '^2): '] = this.roundOf(
                  this._sharedService.convertUomInUI(surfaceAreaVal, conversionValue, isEnableUnitConversion),
                  3
                );
              if (volumeVal >= 0.001)
                this.propertiesSelectedEntities[propertyIndex++ + '. Volume (' + conversionValue + '^3): '] = this.roundOf(
                  this._sharedService.convertUomInUI(volumeVal, conversionValue, isEnableUnitConversion),
                  3
                );
              if (boundingBoxArr[0] >= 0.001)
                this.propertiesSelectedEntities[propertyIndex++ + '. Length (' + conversionValue + '): '] = this.roundOf(
                  this._sharedService.convertUomInUI(boundingBoxArr[0], conversionValue, isEnableUnitConversion),
                  3
                );
              if (boundingBoxArr[1] >= 0.001)
                this.propertiesSelectedEntities[propertyIndex++ + '. Width (' + conversionValue + '): '] = this.roundOf(
                  this._sharedService.convertUomInUI(boundingBoxArr[1], conversionValue, isEnableUnitConversion),
                  3
                );
              if (boundingBoxArr[2] >= 0.001)
                this.propertiesSelectedEntities[propertyIndex++ + '. Height (' + conversionValue + '): '] = this.roundOf(
                  this._sharedService.convertUomInUI(boundingBoxArr[2], conversionValue, isEnableUnitConversion),
                  3
                );
            }
            this.viewerTools.propertiesButtonActive && this.propertiesPanData('SelectedEntities');
            /** ExpCustom - END Properties Pane Update */

            const aShapeID = aBrepRep.shapeId(theSelectedShape);
            /* Add shape to the selected shapes collection: */
            this._selectedShapes.add(aShapeID);
            currentShapeID = aShapeID;
            this.selectedShapeId = +aShapeID;
            console.log('Selected shape ID: ', aShapeID);
            const updateModel = document.getElementById('update-model');
            updateModel?.style && (updateModel.style.display = 'block');
          });
        });
      }

      /* Clear all selections from all elements of the features tree: */
      document.querySelectorAll('[data-shape-id-1]').forEach((theElement) => theElement.classList.remove('feature-selected'));

      /* For each element in the selected shapes collection, add a selection to the features tree: */
      this._selectedShapes.forEach((theShapeID) => {
        const aFeaturesElements = document.querySelectorAll(`[data-shape-id-1~='${theShapeID}']`);
        if (aFeaturesElements.length) {
          aFeaturesElements.forEach((theElement) => {
            /* Highlight tree element. */
            theShapeID === currentShapeID && theElement.classList.add('feature-selected'); // Expcustom - only one selection at a time
            /* Open tree to element. */
            let anElementParent = theElement.parentElement;
            while (true) {
              if (anElementParent && anElementParent.tagName === 'DETAILS') {
                anElementParent.setAttribute('open', 'true');
                this.selectedCentroid = theElement.getAttribute('param-centroid');
              } else {
                break;
              }
              if (anElementParent && anElementParent.parentElement && anElementParent.parentElement.tagName === 'DETAILS') {
                anElementParent = anElementParent.parentElement;
                continue;
              }
              break;
            }
          });
          /* When selected through the viewer - scroll the tree view to this element: */
          const aFeaturesTree = document.querySelector('.tree-view-panel-1 > details');
          if (aFeaturesTree instanceof HTMLElement) {
            /* offsetTop - the distance of the aFeaturesElements[0] element in relation to the top of aFeaturesTree. */
            const aTargetElement = aFeaturesElements[0];
            if (aTargetElement instanceof HTMLElement) {
              const aFeaturesElementScrollTop = aTargetElement.offsetTop - aFeaturesTree.offsetTop;
              aFeaturesTree.scrollTo({
                /* Scroll to first element if there are multiple elements: */
                top: aFeaturesElementScrollTop,
                behavior: 'smooth',
              });
            }
          }
        }
      });
    }
    this._blockUiService.popBlockUI('onSelectionChangedBySceneDFM');
  }

  onFeaturesTreeElementClick(theEvent) {
    /* Get a B-Rep representation of selected part: */
    const aBrepRep = this._selectedPart.representation instanceof cadex.ModelData_BRepRepresentation ? this._selectedPart.representation : this._selectedPart.sge.brepRepresentation();
    /* Shape selection is only available for BRep representation: */
    if (!aBrepRep) {
      console.error('Shape cannot be selected: The representation of the selected part is not a BRep.');
      return;
    }

    const aTargetElement = theEvent.currentTarget;
    if (!aTargetElement) {
      return;
    }
    aTargetElement.dataset.shapeId = aTargetElement.dataset['shapeId-1']; // fix ExpCustom
    /* If there are no shapes associated with the tree element: */
    if (!aTargetElement.dataset.shapeId) {
      return;
    }
    /**
     * A collection of shape IDs associated with the clicked features tree elements.
     * @type {Array<string>}
     */
    const aShapeIDs = aTargetElement.dataset.shapeId?.split(' ');

    /* A collection of cadex.ModelData_Shape objects associated with the collection of shape IDs. */
    /** @type {Map<string, cadex.ModelData_Shape>} */
    const aTargetShapes = new Map();
    aShapeIDs.forEach((theShapeID) => {
      const aShape = aBrepRep.shape(Number(theShapeID));
      if (aShape) {
        aTargetShapes.set(theShapeID, aShape);
      }
    });
    this.clearShapeId();

    if (!aTargetShapes.size) {
      return;
    }

    /* Clear all selections from all elements of the model on scene: */
    this.scene.selectionManager.deselectAll();
    /* Clear all selections from all elements of the features tree: */
    document.querySelectorAll('[data-shape-id-1]').forEach((theElement) => theElement.classList.remove('feature-selected'));

    aTargetShapes.forEach((theShape, theShapeID) => {
      /* Need for finding the target body scene node: */
      /** @type {Array<cadex.ModelData_Body>} */
      const aTargetBodies = [];
      Array.from(this._colorizedBodiesCollection.entries()).forEach((theBodiesCollectionElement) => {
        theBodiesCollectionElement[1].forEach((theCollectionValue) => {
          if (theCollectionValue.ids.includes(Number(theShapeID))) {
            aTargetBodies.push(theCollectionValue.body);
          }
        });
      });
      /* If the same shape belongs to several bodies at the same time - highlight for each body (even body is hidden): */
      aTargetBodies.forEach((theBody) => {
        /* Get target body scene node by body: */
        const aTargetBodySceneNode = this._colorizedBodiesSceneNodes.get(theBody);
        if (!aTargetBodySceneNode) {
          return;
        }

        /* Add selection on the scene: */
        const aSelectionItem = new cadex.ModelPrs_SelectionItem(aTargetBodySceneNode, new cadex.ModelPrs_SelectedShapeEntity(theShape));
        this.scene.selectionManager.select(aSelectionItem, /*theBreakSelection*/ false, /*theDispatchEvent*/ false);
      });
    });

    /* Only add a selection to an event target tree element if the selection is from the tree: */
    aTargetElement.classList.add('feature-selected');
  }

  initDFMTree(theProcessDataPart, thePartLabel) {
    const anExampleContainer = document.getElementById('example-container-1');
    if (!anExampleContainer) {
      return;
    }

    const aTreeViewPanel = document.querySelector('.tree-view-panel-1');
    if (!aTreeViewPanel) {
      return;
    }

    anExampleContainer.appendChild(aTreeViewPanel);

    /* If the process data contains error message: */
    const anErrorMessage =
      theProcessDataPart.error || (this._isModelUnfolded ? theProcessDataPart.featureRecognitionUnfolded.message || theProcessDataPart.dfmUnfolded.message : theProcessDataPart.dfm.message);
    if (anErrorMessage) {
      const anErrorMessageElement = document.createElement('div');
      anErrorMessageElement.classList.add('error-message');
      anErrorMessageElement.innerHTML = anErrorMessage;
      aTreeViewPanel.appendChild(anErrorMessageElement);
      return;
    }

    /* Form the DFM features tree as a tree of HTML-details elements: */
    const aRootElement = document.createElement('details');
    aRootElement.setAttribute('open', 'true');
    const aRootElementSummary = document.createElement('summary');
    const aRootElementLabel = document.createElement('div');
    aRootElementLabel.classList.add('label');
    aRootElementLabel.innerHTML = thePartLabel;
    aRootElementSummary.appendChild(aRootElementLabel);
    aRootElement.appendChild(aRootElementSummary);

    /* Getting dfm data depending on the type of model: */
    const aDFMData = this._isModelUnfolded ? theProcessDataPart.dfmUnfolded : theProcessDataPart.dfm;
    const aFeatureGroups = aDFMData.featureGroups;
    if (!aFeatureGroups) {
      return;
    }
    aFeatureGroups.forEach((theFeatureGroup) => {
      const aFeatureGroupElement = document.createElement('details');
      aFeatureGroupElement.setAttribute('open', 'true');

      const aFeatureGroupElementSummary = document.createElement('summary');
      aFeatureGroupElement.appendChild(aFeatureGroupElementSummary);

      const aFeatureGroupElementLabel = document.createElement('div');
      aFeatureGroupElementLabel.classList.add('label');
      aFeatureGroupElementLabel.innerHTML = theFeatureGroup.name;
      aFeatureGroupElementSummary.appendChild(aFeatureGroupElementLabel);

      if (theFeatureGroup.color) {
        const aFeatureGroupElementColorSquare = document.createElement('div');
        aFeatureGroupElementColorSquare.style.backgroundColor = `rgb${theFeatureGroup.color}`;
        aFeatureGroupElementColorSquare.classList.add('color-square');
        aFeatureGroupElementSummary.appendChild(aFeatureGroupElementColorSquare);
      }

      /* If the feature group has 'features' field, then there are no subgroups: */
      if (theFeatureGroup.features) {
        theFeatureGroup.features.forEach((theFeature) => {
          /* Each feature can be associated with one or more shapes: */
          const aFeatureElement = document.createElement('span');
          if (Number(theFeature.shapeIDCount) > 0) {
            aFeatureElement.setAttribute('data-shape-id-1', theFeature.shapeIDs.map((theShapeID) => theShapeID.id).join(' '));
          }
          aFeatureElement.innerHTML = theFeatureGroup.name.replace('(s)', '');
          /* Calling a selection on the scene for the click event on an element of the features tree: */
          aFeatureElement.addEventListener('click', this.onFeaturesTreeElementClick.bind(this));
          aFeatureGroupElement.appendChild(aFeatureElement);
        });
      } else if (theFeatureGroup.subGroups) {
        theFeatureGroup.subGroups.forEach((theSubGroup) => {
          const aSubGroupElement = document.createElement('details');

          const aSubGroupElementSummary = document.createElement('summary');
          aSubGroupElement.appendChild(aSubGroupElementSummary);

          const aSubGroupElementLabel = document.createElement('div');
          aSubGroupElementLabel.classList.add('label');
          const aParametersValues = theSubGroup.parameters.map((theParameter) => (isNaN(Number(theParameter.value)) ? theParameter.value : Number(theParameter.value).toFixed(2)));
          aSubGroupElementLabel.innerHTML = theFeatureGroup.name.replace('(s)', '') + ' (' + aParametersValues.join(', ') + ')';
          aSubGroupElementSummary.appendChild(aSubGroupElementLabel);

          theSubGroup.features?.forEach((theFeature) => {
            /* Each feature can be associated with one or more shapes: */
            const aFeatureElement = document.createElement('span');
            if (Number(theFeature.shapeIDCount) > 0) {
              aFeatureElement.setAttribute('data-shape-id-1', theFeature.shapeIDs.map((theShapeID) => theShapeID.id).join(' '));
            }
            const aParameters = theSubGroup.parameters
              .map((theParameter) => `${theParameter.name} - ${isNaN(Number(theParameter.value)) ? theParameter.value : Number(theParameter.value).toFixed(2)} ${theParameter.units}`)
              .join(', ');
            aFeatureElement.innerHTML = aParameters;
            /* Calling a selection on the scene for the click event on an element of the features tree: */
            aFeatureElement.addEventListener('click', this.onFeaturesTreeElementClick.bind(this));
            aSubGroupElement.appendChild(aFeatureElement);
          });

          aFeatureGroupElement.appendChild(aSubGroupElement);
        });
      }

      aRootElement.appendChild(aFeatureGroupElement);
    });

    aTreeViewPanel.appendChild(aRootElement);
  }

  initFeaturesTree(theProcessDataPart, thePartLabel) {
    const anExampleContainer = document.getElementById('example-container-1');
    if (!anExampleContainer) {
      return;
    }

    const aTreeViewPanel = document.querySelector('.tree-view-panel-1');
    if (!aTreeViewPanel) {
      return;
    }

    anExampleContainer.appendChild(aTreeViewPanel);

    /* If the process data contains error message: */
    const anErrorMessage = theProcessDataPart.error || (this._isModelUnfolded ? theProcessDataPart.featureRecognitionUnfolded.message : theProcessDataPart.featureRecognition.message);
    if (anErrorMessage) {
      const anErrorMessageElement = document.createElement('div');
      anErrorMessageElement.classList.add('error-message');
      anErrorMessageElement.innerHTML = anErrorMessage;
      aTreeViewPanel.appendChild(anErrorMessageElement);
      return;
    }

    /* Features tab for unfolded model contain some basic information: */
    if (this._isModelUnfolded) {
      const anUnfoldedFeaturesElement = document.createElement('section');
      anUnfoldedFeaturesElement.classList.add('unfolded-features');

      const aParameters = theProcessDataPart.featureRecognitionUnfolded.parameters;
      if (!aParameters) {
        return;
      }
      aParameters.forEach((theParameter) => {
        const anUnfoldedFeatureElement = document.createElement('article');

        const aParameterName = document.createElement('div');
        aParameterName.innerHTML = theParameter.name;

        const aParameterValue = document.createElement('div');
        aParameterValue.innerHTML = isNaN(Number(theParameter.value)) ? theParameter.value : Number(theParameter.value).toFixed(2);

        const aParameterUnits = document.createElement('div');
        aParameterUnits.innerHTML = theParameter.units;

        anUnfoldedFeatureElement.appendChild(aParameterName);
        anUnfoldedFeatureElement.appendChild(aParameterValue);
        anUnfoldedFeatureElement.appendChild(aParameterUnits);

        anUnfoldedFeaturesElement.appendChild(anUnfoldedFeatureElement);
      });

      aTreeViewPanel.appendChild(anUnfoldedFeaturesElement);
    } else {
      /* Form the Features tree as a tree of HTML-details elements: */
      const aRootElement = document.createElement('details');
      aRootElement.setAttribute('open', 'true');
      const aRootElementSummary = document.createElement('summary');
      const aRootElementLabel = document.createElement('div');
      aRootElementLabel.classList.add('label');
      aRootElementLabel.innerHTML = thePartLabel;
      aRootElementSummary.appendChild(aRootElementLabel);
      aRootElement.appendChild(aRootElementSummary);

      const aFeatureGroups = theProcessDataPart.featureRecognition.featureGroups;
      if (!aFeatureGroups) {
        return;
      }

      let matchingSubGroups = [aFeatureGroups];
      /** Expcustom - apply feature button - start */
      if (this.partData.caller === 'manufacturing' && [3, 4].includes(this.commodityId)) {
        aRootElement.appendChild(this.dfmFeaturesLib.getApplyButton('update-model'));
        // aRootElement.appendChild(this.dfmFeaturesLib.getApplyButton('apply-features'));
        console.log(this.partData?.datumCentroid);
        this.datumCentroid = this.partData?.datumCentroid;

        matchingSubGroups = [
          this.machiningHelperService.getReorderedFeatures(aFeatureGroups, this.datumCentroid, 'lesser'),
          this.machiningHelperService.getReorderedFeatures(aFeatureGroups, this.datumCentroid, 'greater'),
        ];
      }
      /** Expcustom - apply feature button - end */
      matchingSubGroups.forEach((aFeatureGroup, setIndex) => {
        if (setIndex > 0) {
          const separator = document.createElement('hr');
          aRootElement.appendChild(separator);
        }
        if (this.partData.caller === 'manufacturing' && [3, 4].includes(this.commodityId)) {
          aRootElement.appendChild(this.dfmFeaturesLib.getApplyButton('apply-feature-set', setIndex));
        }
        aFeatureGroup.forEach((theFeatureGroup, groupIndex) => {
          const groupOrder = groupIndex + 1;
          const aFeatureGroupElement = document.createElement('details');
          aFeatureGroupElement.setAttribute('open', 'true');

          const aFeatureGroupElementSummary = document.createElement('summary');
          aFeatureGroupElement.appendChild(aFeatureGroupElementSummary);

          const aFeatureGroupElementLabel = document.createElement('div');
          aFeatureGroupElementLabel.classList.add('label');
          aFeatureGroupElementLabel.innerHTML = groupOrder + '. ' + theFeatureGroup.name;
          aFeatureGroupElementSummary.appendChild(aFeatureGroupElementLabel);

          if (theFeatureGroup.color) {
            const aFeatureGroupElementColorSquare = document.createElement('div');
            aFeatureGroupElementColorSquare.style.backgroundColor = `rgb${theFeatureGroup.color}`;
            aFeatureGroupElementColorSquare.classList.add('color-square');
            aFeatureGroupElementSummary.appendChild(aFeatureGroupElementColorSquare);
          }

          /* If the feature group has 'features' field, then there are no subgroups: */
          if (theFeatureGroup.features) {
            theFeatureGroup.features.forEach((theFeature, featureIndex) => {
              /* Each feature can be associated with one or more shapes: */
              const featureOrder = featureIndex + 1;
              const aFeatureElement = document.createElement('span');
              if (Number(theFeature.shapeIDCount) > 0) {
                aFeatureElement.setAttribute('data-shape-id-1', theFeature.shapeIDs.map((theShapeID) => theShapeID.id).join(' '));
              }
              aFeatureElement.innerHTML = groupOrder + '.' + featureOrder + '. ' + theFeatureGroup.name.replace('(s)', '');
              /* Calling a selection on the scene for the click event on an element of the features tree: */
              aFeatureElement.addEventListener('click', this.onFeaturesTreeElementClick.bind(this));
              aFeatureGroupElement.appendChild(aFeatureElement);
            });
          } else if (theFeatureGroup.subGroups) {
            theFeatureGroup.subGroups.forEach((theSubGroup, subgroupIndex) => {
              const subGroupOrder = subgroupIndex + 1;
              const aSubGroupElement = document.createElement('details');
              const aSubGroupElementSummary = document.createElement('summary');
              aSubGroupElement.appendChild(aSubGroupElementSummary);

              const aSubGroupElementLabel = document.createElement('div');
              aSubGroupElementLabel.classList.add('label');
              const aParametersValues = theSubGroup.parameters.map((theParameter) => (isNaN(Number(theParameter.value)) ? theParameter.value : Number(theParameter.value).toFixed(2)));
              aSubGroupElementLabel.innerHTML = groupOrder + '.' + subGroupOrder + '. ' + theFeatureGroup.name.replace('(s)', '') + ' (' + aParametersValues.join(', ') + ')';
              aSubGroupElementSummary.appendChild(aSubGroupElementLabel);

              theSubGroup.features?.forEach((theFeature, fIndex) => {
                /* Each feature can be associated with one or more shapes: */
                const fOrder = fIndex + 1;
                const aFeatureElement = document.createElement('span');
                aFeatureElement.classList.add('feature-container');
                if (Number(theFeature.shapeIDCount) > 0) {
                  aFeatureElement.setAttribute('data-shape-id-1', theFeature.shapeIDs.map((theShapeID) => theShapeID.id).join(' '));
                }
                const numbering = groupOrder + '.' + subGroupOrder + '.' + fOrder + '. ';
                const aParameters = theSubGroup.parameters
                  .map((theParameter) => `${theParameter.name} - ${isNaN(Number(theParameter.value)) ? theParameter.value : Number(theParameter.value).toFixed(2)} ${theParameter.units}`)
                  .join(', ');
                aFeatureElement.setAttribute('param-centroid', theSubGroup.parameters.find((param) => param.name === 'Centroid')?.value || '');
                if (this.partData.caller === 'manufacturing') {
                  const fName = theFeatureGroup.name.replace('(s)', '');
                  const currentFeatureId = theFeature?.featureIdentifier ?? ((groupIndex + 1) * 10000 + (subgroupIndex + 1) * 100 + (fIndex + 1)).toString();
                  const featureAttributes: any = { disabled: false, checked: false, dimTolerance: 0, surfaceFinish: 0, gdtSelect: 1, gdtVal: 0 };
                  const currentFeature = this.partData.featureEntries.find((x) => x.id === currentFeatureId);
                  if (currentFeature) {
                    featureAttributes.disabled = currentFeature.existing;
                    featureAttributes.checked = true;
                    featureAttributes.dimTolerance = currentFeature.dimTolerance;
                    featureAttributes.surfaceFinish = currentFeature.surfaceFinish;
                    featureAttributes.gdtSelect = currentFeature.gdtSelect;
                    featureAttributes.gdtVal = currentFeature.gdtVal;
                  }
                  aFeatureElement.appendChild(this.dfmFeaturesLib.getFeatureCheckbox(fName, aParameters, currentFeatureId, featureAttributes.disabled, featureAttributes.checked, setIndex, numbering)); // checkbox
                  aFeatureElement.appendChild(this.dfmFeaturesLib.getFeatureToleranceFields('Dimensional Tolerance (mm)', 'dimTolerance', currentFeatureId, 'number', featureAttributes.dimTolerance)); // Tolerance Fields
                  aFeatureElement.appendChild(this.dfmFeaturesLib.getFeatureGdtFields('gdtSelect', 'gdtVal', currentFeatureId, 'number', featureAttributes.gdtSelect, featureAttributes.gdtVal)); // Tolerance Fields
                  aFeatureElement.appendChild(this.dfmFeaturesLib.getFeatureToleranceFields('Surface Finish (Ra)', 'surfaceFinish', currentFeatureId, 'number', featureAttributes.surfaceFinish)); // Tolerance Fields
                  // aFeatureElement.innerHTML = '<input type="checkbox" name="feature-checkbox" ' + disabled + ' class="feature-checkbox" value="' + fName + ' -> ' + aParameters + ' -> ' + currentFeatureId + '"/>'
                  //   + aParameters; // Expcustom - feature checkbox
                } else {
                  aFeatureElement.innerHTML = numbering + ' ' + aParameters;
                }
                /* Calling a selection on the scene for the click event on an element of the features tree: */
                aFeatureElement.addEventListener('click', this.onFeaturesTreeElementClick.bind(this));
                aSubGroupElement.appendChild(aFeatureElement);
              });

              aFeatureGroupElement.appendChild(aSubGroupElement);
            });
          }
          aRootElement.appendChild(aFeatureGroupElement);
        });
        aTreeViewPanel.appendChild(aRootElement);
      });
    }
  }

  async initFeaturesSelector(theFeatureGroups) {
    if (!theFeatureGroups.length) {
      return;
    }

    /* Features dropdown selector in the DFM panel: */
    const aFeaturesSelector = document.createElement('select');
    aFeaturesSelector.classList.add('features-selector-1');
    const anAllOption = document.createElement('option');
    anAllOption.value = 'All Features';
    anAllOption.text = 'All Features';
    aFeaturesSelector.appendChild(anAllOption);
    theFeatureGroups.forEach((theFeatureGroup) => {
      const theFeatureName = theFeatureGroup.name;
      const anOption = document.createElement('option');
      anOption.value = theFeatureName;
      anOption.text = theFeatureName;
      aFeaturesSelector.appendChild(anOption);
    });

    /* Add onChange event listener: */
    aFeaturesSelector.addEventListener('change', async (theEvent) => {
      const aTargetElement = /** @type {HTMLSelectElement} */ theEvent.target as HTMLSelectElement;
      /** @type {Map<cadex.ModelData_Body, {r: number, g: number, b: number}>} */
      const aTargetBodies = new Map();
      const aTargetBodiesCollection = [];

      if (aTargetElement.value === 'All Features') {
        document.querySelectorAll('.tree-view-panel-1 > details > details').forEach((theElement) => theElement.classList.remove('hidden'));
        theFeatureGroups.forEach((theFeatureGroup) => {
          const aColorizedBodiesCollectionElement = this._colorizedBodiesCollection.get(theFeatureGroup.name);
          if (aColorizedBodiesCollectionElement) {
            aColorizedBodiesCollectionElement.forEach((theBodyCollectionElement) => aTargetBodiesCollection.push(theBodyCollectionElement));
          }
        });
      } else {
        document.querySelectorAll('.tree-view-panel-1 > details > details').forEach((theElement) => theElement.classList.add('hidden'));
        const aTargetSummary = Array.prototype.slice.call(document.getElementsByTagName('summary')).filter((theElement) => theElement.textContent.trim() === aTargetElement.value.trim())[0];
        const aTargetDetails = aTargetSummary.parentElement;
        aTargetDetails.classList.remove('hidden');

        const aSelectedFeatureName = aTargetElement.value;
        const aColorizedBodiesCollectionElement = this._colorizedBodiesCollection.get(aSelectedFeatureName);
        if (aColorizedBodiesCollectionElement) {
          aColorizedBodiesCollectionElement.forEach((theBodyCollectionElement) => aTargetBodiesCollection.push(theBodyCollectionElement));
        }
      }

      for (const aTargetBodiesCollectionElement of aTargetBodiesCollection) {
        aTargetBodies.set(aTargetBodiesCollectionElement.body, aTargetBodiesCollectionElement.color);
      }

      await this.removeRootPart();
      await this.addRootPart(this._selectedPart.sge, this._selectionMode);

      /* Clear bodies scene nodes collections for every feature selector change: */
      this._colorizedBodiesSceneNodes.clear();
      /* Show colorized selected features on the scene: */
      for (const theBody of aTargetBodies.entries()) {
        const aBodySceneNode = await this.addBodyToRootPart(theBody[0], theBody[1]);
        if (aBodySceneNode) {
          this._colorizedBodiesSceneNodes.set(theBody[0], aBodySceneNode);
        }
      }

      /* Shade all representation shapes to preserve the silhouette of the model: */
      const aBRepRepresentation = this._selectedPart.representation instanceof cadex.ModelData_BRepRepresentation ? this._selectedPart.representation : this._selectedPart.sge.brepRepresentation();
      if (aBRepRepresentation) {
        /* Shade all other representation shapes: */
        const aColorizedShapesIDs = aTargetBodiesCollection.reduce(
          (thePrev, theCurr) => {
            theCurr.ids.forEach((/** @type {number} */ theID) => thePrev.push(theID));
            return thePrev;
          },
          /** @type {Array<number>} */ []
        );
        await this.shadeAllRepresentationShapes(aBRepRepresentation, aColorizedShapesIDs);
      }
    });

    /* Add features selector on tree-view-panel after tree-type-selector: */
    const aTreeTypeSelector = document.querySelector('.tree-type-selector-1');
    if (aTreeTypeSelector) {
      const aParent = aTreeTypeSelector.parentNode;
      if (aParent) {
        aParent.insertBefore(aFeaturesSelector, aTreeTypeSelector.nextSibling);
      }
    }
  }

  changeDatum = (proceed: boolean = true) => {
    document.getElementById('error-notification').style.display = 'none';
    document.getElementById('error-notification').innerHTML = '';
    if (proceed && !!this.selectedShapeId) {
      this.machiningService
        .updatePlaneOnModel(this.partId, this.projectId, this.selectedShapeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result) => {
            if (result) {
              console.log('Datum updated successfully');
              this.activeModal.close({ reopen: true, selectedCentroid: this.selectedCentroid });
            } else {
              document.getElementById('error-notification').style.display = 'block';
              document.getElementById('error-notification').innerHTML = 'Datum not changed. Please select the right face.';
            }
            this.clearShapeId();
          },
          error: (err) => {
            console.error('Error while updating datum. Please try a different face', err);
            this.clearShapeId();
          },
        });
    }
  };

  clearShapeId() {
    if (!!this.selectedShapeId) {
      this.selectedShapeId = null;
      const updateModel = document.getElementById('update-model');
      updateModel?.style && (updateModel.style.display = 'none');
      this.selectedCentroid = null;
      console.log('Selected shape ID cleared');
    }
  }
}

class SelectedEntityVisitor extends cadex.ModelPrs_SelectedEntityVisitor {
  selectedShapes: any;
  visitPolyShapeEntity() {
    /* Method not implemented. */
  }

  override visitPolyFaceEntity(_thePolyFaceEntity: cadex.ModelPrs_SelectedPolyFaceEntity): void {}

  override visitPolyLineEntity(_thePolyLineEntity: cadex.ModelPrs_SelectedPolyLineEntity): void {}

  visitPolyVertexEntity() {
    /* Method not implemented. */
  }

  override visitPointEntity(_thePointEntity: cadex.ModelPrs_SelectedPointEntity) {}

  constructor() {
    super();
    /** @type {Set<cadex.ModelData_Shape>} */
    this.selectedShapes = new Set();
  }

  /**
   * Fill the SelectedEntityVisitor selected shapes collection.
   * @override
   * @param {cadex.ModelPrs_SelectedShapeEntity} theShapeEntity
   */
  visitShapeEntity(theShapeEntity) {
    this.selectedShapes.add(theShapeEntity.shape);
  }
}

function collectShapesIDs(theFeatureGroup) {
  const anIDs = [];
  const aColor = theFeatureGroup.color.match(/\d+/g);
  /* RGB color as {[0-1], [0-1], [0-1]}: */
  const aRGBColor = aColor
    ? {
        r: Number(aColor[0]) / 255,
        g: Number(aColor[1]) / 255,
        b: Number(aColor[2]) / 255,
      }
    : {
        r: 1,
        g: 1,
        b: 1,
      };

  function collectIDsRecursively(theObject) {
    Object.entries(theObject).forEach((theEntry) => {
      if (theEntry[0] === 'id') {
        const anID = Number(theEntry[1]);
        /* Need to add color only for the first match: */
        if (!anIDs.includes(anID)) {
          anIDs.push(anID);
        }
      } else if (typeof theEntry[1] === 'object') {
        collectIDsRecursively(theEntry[1]);
      }
    });
  }
  collectIDsRecursively(theFeatureGroup);

  return {
    color: aRGBColor,
    ids: anIDs,
  };
}
