import { BasePanel } from '../base-panel';

// import cadex, { ModelPrs_InputManager } from '@cadexchanger/web-toolkit';
import cadex from '@cadexchanger/web-toolkit';
// import { MeasurementsManager } from './measurement-panel';

declare const $: any;

/**
 * Interface for additional 'treeId' property.
 * @typedef {{treeId: ?string }}
 */
export let TreeSceneNode;

/**
 * @typedef {{
 *   scene: cadex.ModelPrs_Scene,
 *   modelSceneNode: cadex.ModelPrs_SceneNode,
 *   domElement: HTMLElement,
 *   title?: string,
 *   types: Record<string, {icon: string}>
 *   multiSelection?: boolean,
 * }}
 */
export let StructurePanelConfig;

/**
 * @type {Partial<StructurePanelConfig>}
 */
export const StructurePanelDefaultConfig = {
  title: 'Structure',
  types: {},
  multiSelection: true,
};

/**
 * @enum {number}
 */
// const MeasurementMode = {
//   TwoPointDistance: 0,
//   ThreePointAngle: 1,
// };

/**
 * @typedef {Object} PMISceneData
 * @property {Array<cadex.ModelPrs_SceneNode & CustomPMISceneNode>} sceneNodes
 * @property {GroupedPMIData<string>} sceneNodesByType
 * @property {GroupedPMIData<cadex.ModelData_PMISavedView>} sceneNodesBySavedViews
 */

/**
 * @typedef JstreeSGENodeData
 * @property {cadex.ModelData_SceneGraphElement} sge
 * @property {cadex.ModelData_PMITable | null} pmiTable
 * @property {cadex.ModelPrs_SceneNode } sceneNode
 * @property {cadex.ModelPrs_SceneNode } [representationSceneNode]
 * @property {PMISceneData} [pmiSceneData]
 */

/**
 * @typedef JstreeSGENode
 * @property {string} text
 * @property {string} type
 * @property {JstreeSGENodeData} data
 */

export class StructurePanel extends BasePanel {
  /**
   * @param {StructurePanelConfig} theConfig
   */
  scene: any;
  modelSceneNode: any;
  representationMask: any;
  jstree: any;
  sceneGraphTree: any;
  pmiTreeManager: any;
  pmiTree: any;
  /** @type {HTMLSelectElement} */ savedViewsDropDown: HTMLSelectElement;
  /** @type {PMISceneData|null} */ pmiSceneData: any;
  sgeNodeTransformation: cadex.ModelData_Transformation;
  pmiSceneNodeFactory: cadex.ModelPrs_SceneNodeFactory;
  pmiSceneNodeAppearance: cadex.ModelData_Appearance;
  measurementsFactory: cadex.ModelPrs_MeasurementFactory;
  viewport: any;
  // measurementsManager: MeasurementsManager;
  readonly exploreBodies = true;
  private isLeafNode: (jstreeNode: any) => boolean;

  constructor(theConfig) {
    const aConfig = /** @type {Required<StructurePanelConfig>} */ Object.assign({}, StructurePanelDefaultConfig, theConfig);
    super(aConfig);

    this.scene = theConfig.scene;
    this.viewport = theConfig.viewport;
    this.modelSceneNode = theConfig.modelSceneNode;
    this.representationMask = cadex.ModelData_RepresentationMask.ModelData_RM_BRep;

    const aStyle = new cadex.ModelPrs_Style();
    aStyle.highlightAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0x66cc00));
    aStyle.boundariesHighlightAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0xb2ff65));
    this.modelSceneNode.style = aStyle;
    this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Node | cadex.ModelPrs_SelectionMode.Vertex | cadex.ModelPrs_SelectionMode.PolyVertex;

    this.domElement.classList.add('structure-panel');
    this.domElement.classList.add('tree-panel');
    // const aJSTreeConfig = {
    //   core: {
    //     multiple: aConfig.multiSelection,
    //     check_callback: true,
    //     themes: {
    //       name: null, //'default',
    //       dots: true,
    //     },
    //   },
    //   types: aConfig.types,
    //   plugins: ['wholerow', 'types', 'sgestates'],
    // };

    this._panelBody.classList.add('structure-panel__tree');

    const aJSTreesConfig = {
      core: {
        multiple: true,
        check_callback: true,
        themes: {
          name: null, //'default',
          dots: true,
        },
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
        'undefined body': {
          icon: 'icon-undefined-body',
        },
        'acorn body': {
          icon: 'icon-acorn-body',
        },
        'wireframe body': {
          icon: 'icon-wireframe-body',
        },
        'sheet body': {
          icon: 'icon-sheet-body',
        },
        'solid body': {
          icon: 'icon-solid-body',
        },
        'triangle set': {
          // icon: 'icon-triangle-set'
          icon: 'icon-solid-body',
        },
        'line set': {
          icon: 'icon-line-set',
        },
        'point set': {
          icon: 'icon-point-set',
        },
        pmi: {
          icon: 'icon-pmi',
        },
        'pmi-element': {
          icon: 'icon-pmi-element',
        },
      },
      plugins: ['wholerow', 'types', 'sgestates'],
    };

    /** @type {PMISceneData|null} */
    this.pmiSceneData = null;

    // Initialize jsTree library used for visualizing scenegraph structure (see https://www.jstree.com/)
    $(this._panelBody)
      .jstree(aJSTreesConfig)
      .on('open_node.jstree', (_theEvent, _theData) => {
        if (document.getElementById('help-pmi').style.display === 'block') {
          // $('.structure-panel__tree > ul > li:nth-child(2) .jstree-sge-state ').css('display', 'none'); // hide checkbox for pmi tree on reopening
          $('.structure-panel__tree > ul > li .jstree-sge-state ').css('display', 'none'); // hide checkbox for pmi tree
        }
      })
      .on('changed.jstree', (_theEvent, theData) => this.onSelectionChangedByTreeView(theData.selected))
      // .on('activate_node.jstree', (_theEvent, theData) => this.onDisplayedChangedByTreeView(theData.node, theData.displayed))
      .on('select_node.jstree', (_theEvent, theData) => this.onSelectedByTreeView(theData.node))
      .on('deselect_node.jstree', (_theEvent, theData) => this.onDeselectedByTreeView(theData.node))
      .on('deselect_all.jstree', (/*theEvent, theData*/) => this.onDeselectedAllByTreeView())
      .on('activate_node.jstree', (_theEvent, theData) => this.onDisplayedChangedByTreeView(theData.node, theData.displayed));
    this.sceneGraphTree = $(this._panelBody).jstree(true);

    //this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Node;

    this.scene.selectionManager.addEventListener('selectionChanged', this.onSelectionChangedByScene.bind(this));
    if (this.exploreBodies) {
      this.isLeafNode = (jstreeNode: any) => {
        return jstreeNode.type.endsWith('body') || jstreeNode.type.endsWith('set');
      };
    } else {
      this.isLeafNode = (jstreeNode: any) => {
        return jstreeNode.type === 'part';
      };
    }
    $('#file-pmi-elements')
      .jstree(aJSTreesConfig)
      .on('select_node.jstree', async (_theEvent, theData) => {
        const aNodeData = theData.node?.data;
        if (aNodeData && aNodeData.sceneNode) {
          this.scene.selectionManager.selectNode(aNodeData.sceneNode, /*break selection*/ false);
          //this.pmiSceneData?.sceneNodes.forEach((theNode) => this.scene.selectionManager.selectNode(aNodeData.sceneNode, /*break selection*/ false));
        }
      })
      .on('deselect_all.jstree', () => {
        this.pmiSceneData?.sceneNodes.forEach((theNode) => this.scene.selectionManager.deselectNode(theNode));
      });
    this.pmiTree = $('#file-pmi-elements').jstree(true);

    this.savedViewsDropDown = /** @type {HTMLSelectElement} */ document.getElementById('file-pmi-saved-views-select') as HTMLSelectElement;
    this.savedViewsDropDown.onchange = this.onSavedViewChanged.bind(this);

    /** @type {PMISceneData|null} */
    this.pmiSceneData = null;
    this.sgeNodeTransformation = new cadex.ModelData_Transformation();

    this.pmiSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.pmiSceneNodeAppearance = new cadex.ModelData_Appearance(new cadex.ModelData_ColorObject());
    this.clearPMI();

    // this.measurementsManager = new MeasurementsManager(this.scene, this.viewport);
    // this.viewport.inputManager.pushInputHandler(this.measurementsManager);
    this.jstree = $(this._panelBody).jstree(true);
  }
  reset() {
    // Recreate factory to release data cache stored by factory.
    this.pmiSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.clearPMI();
  }

  /**
   * @param {JstreeSGENode} theNode
   */
  async loadSGENodePMI(theNode) {
    this.clearPMI(false);

    const aNodeData = theNode.data;
    const aSGENodeTransformation = aNodeData?.sceneNode?.combinedTransformation;
    if (aSGENodeTransformation) {
      this.sgeNodeTransformation.copy(aSGENodeTransformation);
    } else {
      this.sgeNodeTransformation.makeIdentity();
    }
    if (aNodeData.pmiTable) {
      if (!aNodeData.pmiSceneData) {
        let aBRepRep;
        let aBRepRepNode;
        if (aNodeData.representationSceneNode && aNodeData.sge instanceof cadex.ModelData_Part) {
          aBRepRep = aNodeData.sge.brepRepresentation();
          if (aBRepRep) {
            aBRepRepNode = aNodeData.representationSceneNode;
          }
        }
        aNodeData.pmiSceneData = await this.convertPMITable(aNodeData.pmiTable, aBRepRep, aBRepRepNode);
        aNodeData.pmiSceneData.sceneNodes.forEach((theNode) => aNodeData.sceneNode.addChildNode(theNode));
      }
      this.pmiSceneData = aNodeData.pmiSceneData;

      const aSGNode = this.pmiTree.create_node(null, {
        text: theNode.text,
        type: theNode.type,
        data: aNodeData,
      });

      // Feed PMI elements tree
      this.pmiSceneData.sceneNodesByType.forEach((theGroup) => {
        const anPMITypeGroupTreeNode = this.pmiTree.create_node(aSGNode, {
          text: theGroup.groupId,
          type: 'pmi',
          data: {
            sceneNodes: theGroup.nodes,
          },
        });

        theGroup.nodes.forEach((theNode) => {
          const aPMINodeId = this.pmiTree.create_node(anPMITypeGroupTreeNode, {
            text: theNode.name,
            type: 'pmi-element',
            data: {
              sceneNode: theNode,
            },
          });
          theNode.pmiTreeId = aPMINodeId;
        });
      });

      // Feed PMI Saved Views dropdown
      const anAllOption = document.createElement('option');
      anAllOption.text = 'All (auto created)';
      this.savedViewsDropDown.add(anAllOption);

      this.pmiSceneData.sceneNodesBySavedViews.forEach((theGroup) => {
        const anOption = document.createElement('option');
        anOption.text = theGroup.groupId.name || 'Unnamed';
        this.savedViewsDropDown.add(anOption);
      });
      this.savedViewsDropDown.selectedIndex = -1;
    } else {
      this.pmiTree.create_node(null, {
        text: 'There is no PMI table available',
        type: 'pmi',
      });
      // Clean up dropdown
      while (this.savedViewsDropDown.options.length > 0) {
        this.savedViewsDropDown.remove(0);
      }
    }

    this.pmiTree.open_all(null, 0);
  }

  /**
   * Loads PMI data items and convert it to scene nodes tree.
   * @param {cadex.ModelData_PMITable} thePMITable
   * @param {cadex.ModelData_BRepRepresentation} [theBrepRep]
   * @param {cadex.ModelPrs_SceneNode} [theBRepRepNode]
   * @return {Promise<PMISceneData>}
   */
  async convertPMITable(thePMITable, theBrepRep, theBRepRepNode) {
    const aPMIDataItems = await thePMITable.pmiDataItems();
    /** @type {Map<cadex.ModelData_PMIGraphicalElement, cadex.ModelPrs_SceneNode & CustomPMISceneNode>} */
    const aGraphicalElementToSceneNodeMap = new Map();
    /** @type Map<string, Array<cadex.ModelPrs_SceneNode & CustomPMISceneNode>> */
    const aSceneNodesByTypeMap = new Map();
    /** @type Map<cadex.ModelData_PMIData, Array<cadex.ModelData_Shape>> */
    const aPMIAssociations = new Map();
    if (theBrepRep) {
      for (const aShape of await theBrepRep.subshapes()) {
        for (const aPMIData of theBrepRep.pmiData(aShape)) {
          let aPMIDataShapes = aPMIAssociations.get(aPMIData);
          if (!aPMIDataShapes) {
            aPMIDataShapes = [];
            aPMIAssociations.set(aPMIData, aPMIDataShapes);
          }
          aPMIDataShapes.push(aShape);
        }
      }
    }

    const anAllPMISceneNodes = aPMIDataItems.map((thePMIData) => {
      let aNode;
      if (thePMIData.graphicalElement) {
        aNode = /** @type {cadex.ModelPrs_SceneNode & CustomPMISceneNode} */ this.pmiSceneNodeFactory.createNodeFromPMIGraphicalElement(thePMIData.graphicalElement);
        aNode.appearance = this.pmiSceneNodeAppearance;
        aGraphicalElementToSceneNodeMap.set(thePMIData.graphicalElement, aNode);
      } else {
        aNode = /** @type {cadex.ModelPrs_SceneNode & CustomPMISceneNode} */ new cadex.ModelPrs_SceneNode();
      }
      aNode.name = thePMIData.name || 'Unnamed';
      aNode.type = Object.keys(cadex.ModelData_PMIType).find((key) => cadex.ModelData_PMIType[key] === thePMIData.type) || 'Undefined';
      const anAssociations = aPMIAssociations.get(thePMIData);
      aNode.associatedShapes = anAssociations;
      if (anAssociations && theBRepRepNode) {
        aNode.associatedShapesSelection = new cadex.ModelPrs_SelectionItem(
          theBRepRepNode,
          anAssociations.map((theShape) => new cadex.ModelPrs_SelectedShapeEntity(theShape))
        );
      }
      let aSimilarNodes = aSceneNodesByTypeMap.get(aNode.type);
      if (!aSimilarNodes) {
        aSimilarNodes = [];
        aSceneNodesByTypeMap.set(aNode.type, aSimilarNodes);
      }
      aSimilarNodes.push(aNode);
      return aNode;
    });

    /** @type {GroupedPMIData<string>} */
    const aSceneNodesByType = Array.from(aSceneNodesByTypeMap, ([groupId, nodes]) => ({ groupId, nodes })).sort((a, b) => a.groupId.localeCompare(b.groupId));

    const aSavedViews = await thePMITable.views();
    /** @type {GroupedPMIData<cadex.ModelData_PMISavedView>} */
    const aSceneNodesBySavedViews = aSavedViews.map((theSavedView) => {
      const aSceneNodes = [];
      for (const anElement of theSavedView.graphicalElements()) {
        const aSceneNode = aGraphicalElementToSceneNodeMap.get(anElement);
        if (aSceneNode) {
          aSceneNodes.push(aSceneNode);
        }
      }
      return {
        groupId: theSavedView,
        nodes: aSceneNodes,
      };
    });

    return {
      sceneNodes: anAllPMISceneNodes,
      sceneNodesByType: aSceneNodesByType,
      sceneNodesBySavedViews: aSceneNodesBySavedViews,
    };
  }

  /**
   * @param {boolean} [theToAddNoteNode]
   */
  clearPMI(theToAddNoteNode = true) {
    const aTreeRoot = this.pmiTree.get_node('#');
    aTreeRoot.children.forEach((theRoot) => this.pmiTree.delete_node(theRoot));
    while (this.savedViewsDropDown.options.length > 0) {
      this.savedViewsDropDown.remove(0);
    }
    if (this.pmiSceneData) {
      this.pmiSceneData.sceneNodes.forEach((thePMISceneNode) => {
        thePMISceneNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Hidden;
      });
      this.pmiSceneData = null;
    }
    if (theToAddNoteNode) {
      this.pmiTree.create_node(null, { text: 'Select tree node to see PMI data', type: 'pmi' });
    }
  }

  onSavedViewChanged() {
    if (!this.pmiSceneData) {
      return;
    }

    if (this.savedViewsDropDown.selectedIndex === 0) {
      this.pmiSceneData.sceneNodes.forEach((theNode) => {
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Visible;
        this.pmiTree.enable_node(theNode.pmiTreeId);
      });
    } else if (this.savedViewsDropDown.selectedIndex > 0) {
      this.pmiSceneData.sceneNodes.forEach((theNode) => {
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Hidden;
        this.pmiTree.disable_node(theNode.pmiTreeId);
      });

      const aSelectedViewData = this.pmiSceneData.sceneNodesBySavedViews[this.savedViewsDropDown.selectedIndex - 1];
      aSelectedViewData.nodes.forEach((theNode) => {
        this.pmiTree.enable_node(theNode.pmiTreeId);
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Visible;
      });
      const aSavedViewCamera = aSelectedViewData.groupId.camera;
      if (aSavedViewCamera) {
        this.viewport.camera.set(
          aSavedViewCamera.location.transformed(this.sgeNodeTransformation),
          aSavedViewCamera.targetPoint.transformed(this.sgeNodeTransformation),
          aSavedViewCamera.upDirection.transformed(this.sgeNodeTransformation)
        );
      }
    }
    this.scene.update();
  }

  clear() {
    const aRootNode = this.jstree.get_node('#');
    this.jstree.delete_node(aRootNode.children);
  }

  /**
   * @private
   * @param {cadex.ModelPrs_SelectionChangedEvent} theEvent
   */
  onSelectionChangedByScene(theEvent) {
    let aSelectedTreeId: string | undefined;
    theEvent.removed.forEach((theRemoved) => {
      // if (theRemoved.isWholeSelectedNode) {
      //   const anIndex = this.measurementsManager.selectedMeasurements.findIndex((theNode) => theNode === theRemoved.node);
      //   this.measurementsManager.selectedMeasurements.splice(anIndex, 1);
      // } else {
      //   const aSelectedPointsCollector = new SelectedPointsCollector();
      //   for (const aSelectedEntity of theRemoved.entities()) {
      //     aSelectedEntity.accept(aSelectedPointsCollector);
      //   }
      //   aSelectedPointsCollector.points.forEach((thePoint) => {
      //     const aTransformation = theRemoved.node.combinedTransformation;
      //     if (aTransformation) {
      //       thePoint?.transform(theRemoved.node.combinedTransformation);
      //     }
      //     this.measurementsManager.selectedPoints = this.measurementsManager?.selectedPoints?.filter(x => !!x); // ExpCustom - Fix
      //     const anIndex = this.measurementsManager?.selectedPoints?.findIndex((theSelectedPoint) => theSelectedPoint?.isEqual(thePoint));
      //     if (anIndex !== -1) {
      //       this.measurementsManager?.selectedPoints?.splice(anIndex, 1);
      //     }
      //   });
      // }
      const aRemovedObject = /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode  & CustomPMISceneNode} */ theRemoved.node;
      if (aRemovedObject.treeId) {
        this.jstree.deselect_node(aRemovedObject.treeId, true);
        this.sceneGraphTree.deselect_node(aRemovedObject.treeId);
      } else if (aRemovedObject.pmiTreeId) {
        this.pmiTree.deselect_node(aRemovedObject.pmiTreeId);
        if (aRemovedObject?.associatedShapesSelection) {
          this.scene.selectionManager.deselect(aRemovedObject.associatedShapesSelection);
        }
      }
    });
    theEvent.added.forEach((theAdded) => {
      // if (theAdded.isWholeSelectedNode) {
      //   this.measurementsManager.selectedMeasurements.push(theAdded.node);
      // } else {
      //   const aSelectedPointsCollector = new SelectedPointsCollector();
      //   for (const aSelectedEntity of theAdded.entities()) {
      //     aSelectedEntity.accept(aSelectedPointsCollector);
      //   }
      //   aSelectedPointsCollector.points.forEach((thePoint) => {
      //     const aTransformation = theAdded.node.combinedTransformation;
      //     if (aTransformation) {
      //       thePoint?.transform(theAdded.node.combinedTransformation);
      //     }
      //     this.measurementsManager?.selectedPoints?.push(thePoint);
      //   });
      // }

      const anAddedObject = /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode   & CustomPMISceneNode} */ theAdded.node;
      if (anAddedObject.treeId) {
        this.jstree.select_node(anAddedObject.treeId, true);
        this.sceneGraphTree.select_node(anAddedObject.treeId);
        aSelectedTreeId = anAddedObject.treeId;
      } else if (anAddedObject.pmiTreeId) {
        this.pmiTree.select_node(anAddedObject.pmiTreeId);
        if (anAddedObject.associatedShapesSelection && anAddedObject.combinedVisibilityMode === cadex.ModelPrs_VisibilityMode.Visible) {
          this.scene.selectionManager.select(anAddedObject.associatedShapesSelection, false);
        }
      }
    });

    // this.measurementsManager.measurementMode = 0;
    // const aMeasurementsModeSelector = /** @type {HTMLElement} */(document.querySelector('#measurements-mode-selector') as HTMLElement);
    // const aMeasurementsModeSelect = /** @type {HTMLSelectElement} */(aMeasurementsModeSelector.querySelector('select') as HTMLSelectElement);
    // this.measurementsManager.measurementMode = MeasurementMode[aMeasurementsModeSelect.value];

    // if (this.measurementsManager?.measurementMode === MeasurementMode.TwoPointDistance && this.measurementsManager?.selectedPoints?.length === 2) {
    //   this.measurementsManager?.createDistanceMeasurement(this.measurementsManager?.selectedPoints[0], this.measurementsManager?.selectedPoints[1]);
    // }
    // if (this.measurementsManager?.measurementMode === MeasurementMode.ThreePointAngle && this.measurementsManager?.selectedPoints.length === 3) {
    //   this.measurementsManager.createAngleMeasurement(this.measurementsManager?.selectedPoints[0], this.measurementsManager?.selectedPoints[1], this.measurementsManager?.selectedPoints[2]);
    // }
    // Handle deselectAll on click on empty space on the viewer
    if (this.scene.selectionManager.numberOfSelectedItems === 0) {
      this.jstree.deselect_all(true);
    }
    if (this.scene.selectionManager.numberOfSelectedItems === 0) {
      this.sceneGraphTree.deselect_all(true);
    }
    if (aSelectedTreeId) {
      this.sceneGraphTree.get_node(aSelectedTreeId, true).children('.jstree-anchor').trigger('focus');
    }
    // Manually notify jsTree plugins about selection change to apply tree styles.
    // this.jstree.trigger('changed', {
    //   action: 'select_by_scene',
    //   selected: this.jstree.get_selected(),
    // });
  }

  onSelectedByTreeView(theJstreeNode: any) {
    this.collectLeafNodes(theJstreeNode).forEach((thePartJstreeNode) => {
      const aSceneNode = thePartJstreeNode.data.sceneNode as cadex.ModelPrs_SceneNode | undefined;
      if (aSceneNode) {
        this.scene.selectionManager.selectNode(aSceneNode, /*theBreakSelection*/ false, /*theDispatchEvent*/ false);
      }
    });
  }

  onDeselectedByTreeView(theJstreeNode: any) {
    this.collectLeafNodes(theJstreeNode).forEach((thePartJstreeNode) => {
      const aSceneNode = thePartJstreeNode.data.sceneNode as cadex.ModelPrs_SceneNode | undefined;
      if (aSceneNode) {
        this.scene.selectionManager.deselectNode(aSceneNode, /*theDispatchEvent*/ false);
      }
    });
  }

  onDeselectedAllByTreeView() {
    this.scene.selectionManager.deselectAll(false);
  }

  // async onDisplayedChangedByTreeView(theJstreeNode: any, theDisplayed: boolean | undefined) {
  //   this.loadSGENodePMI(theJstreeNode);
  //   if (theDisplayed === undefined) {
  //     return;
  //   }
  //   if (this.collectPartJstreeNodes(theJstreeNode).length > 1) {
  //     this.collectLeafNodes(theJstreeNode).forEach(thePartJstreeNode => {
  //       if (thePartJstreeNode.data.sceneNode) {
  //         thePartJstreeNode.data.sceneNode.visibilityMode = theDisplayed ? cadex.ModelPrs_VisibilityMode.Visible : cadex.ModelPrs_VisibilityMode.GhostlyHidden;
  //       }
  //     });
  //   }
  //   else {

  //     this.collectPartJstreeNodes(theJstreeNode).forEach(thePartJstreeNode => {
  //       if (thePartJstreeNode.data.sceneNode) {
  //         thePartJstreeNode.data.sceneNode.visibilityMode = theDisplayed ? cadex.ModelPrs_VisibilityMode.Visible : cadex.ModelPrs_VisibilityMode.GhostlyHidden;
  //       }
  //     });
  //   }

  //   await this.scene.update();
  // }

  // private collectLeafNodes(theJstreeNode: any): Array<any> {
  //   if (this.isLeafNode(theJstreeNode)) {
  //     return [theJstreeNode];
  //   } else {
  //     return theJstreeNode.children_d.reduce((thePartNodes, theChildId) => {
  //       const aChild = this.sceneGraphTree.get_node(theChildId);
  //       if (this.isLeafNode(aChild)) {
  //         thePartNodes.push(aChild);
  //       }
  //       return thePartNodes;
  //     }, []);
  //   }
  // }
  // async onDisplayedChangedByTreeView1(theJstreeNode: object, theDisplayed: boolean | undefined) {
  //   this.loadSGENodePMI(theJstreeNode);
  //   if (theDisplayed === undefined) {
  //     return;
  //   }
  //   this.collectPartJstreeNodes(theJstreeNode).forEach(thePartJstreeNode => {
  //     if (thePartJstreeNode.data.sceneNode) {
  //       thePartJstreeNode.data.sceneNode.visibilityMode = theDisplayed ? cadex.ModelPrs_VisibilityMode.Visible : cadex.ModelPrs_VisibilityMode.GhostlyHidden;
  //     }
  //   });
  //   await this.scene.update();
  // }
  async onDisplayedChangedByTreeView(theJstreeNode: any, theDisplayed: boolean | undefined) {
    this.loadSGENodePMI(theJstreeNode);
    if (theDisplayed === undefined) {
      return;
    }
    this.collectLeafNodes(theJstreeNode).forEach((thePartJstreeNode) => {
      if (thePartJstreeNode.data.sceneNode) {
        thePartJstreeNode.data.sceneNode.visibilityMode = theDisplayed ? cadex.ModelPrs_VisibilityMode.Visible : cadex.ModelPrs_VisibilityMode.Hidden;
      }
    });
    await this.scene.update();
  }

  private collectLeafNodes(theJstreeNode: any): Array<any> {
    if (this.isLeafNode(theJstreeNode)) {
      return [theJstreeNode];
    } else {
      return theJstreeNode.children_d.reduce((thePartNodes, theChildId) => {
        const aChild = this.sceneGraphTree.get_node(theChildId);
        if (this.isLeafNode(aChild)) {
          thePartNodes.push(aChild);
        }
        return thePartNodes;
      }, []);
    }
  }

  //TODO: define type
  //Q: what is theJstreeNode.children_d
  private collectPartJstreeNodes(theJstreeNode: any): Array<any> {
    if (theJstreeNode.type === 'part') {
      return [theJstreeNode];
    } else {
      return theJstreeNode.children_d.reduce((thePartNodes, theChildId) => {
        const aChild = this.sceneGraphTree.get_node(theChildId);
        if (aChild.type === 'part') {
          thePartNodes.push(aChild);
        }
        return thePartNodes;
      }, []);
    }
  }

  /**
   * @param {string[]} theNodeIds
   */
  onSelectionChangedByTreeView(theNodeIds) {
    this.scene.selectionManager.deselectAll(false);

    theNodeIds.forEach((theNodeId) => {
      const aJstreeNode = this.jstree.get_node(theNodeId);
      this.collectGeometryJstreeNodes(aJstreeNode).forEach((thePartJstreeNode) => {
        const aSceneNode = /** @type {cadex.ModelPrs_SceneNode|undefined} */ thePartJstreeNode.data.sceneNode;
        if (aSceneNode) {
          this.scene.selectionManager.selectNode(aSceneNode, /*theBreakSelection*/ false, /*theDispatchEvent*/ false);
        }
      });
    });
    this.dispatchEvent({ type: 'selectionChanged' });
    //this.dispatchEvent({ 'type': 'measurementselectionChanged' });
  }

  /**
   * Collects nodes with geometries to select/display
   * @protected
   * @param {Object} theJstreeNode
   * @returns {Array<Object>}
   */
  collectGeometryJstreeNodes(_theJstreeNode) {
    return [];
  }
}

// class SelectedPointsCollector extends cadex.ModelPrs_SelectedEntityVisitor {
//   points: any;
//   constructor() {
//     super();
//     /** @type {Array<cadex.ModelData_Point>} */
//     this.points = [];
//   }

//   visitPolyShapeEntity(_thePolyShapeEntity: any) {}

//   override visitPolyFaceEntity(_thePolyFaceEntity: cadex.ModelPrs_SelectedPolyFaceEntity): void {}

//   override visitPolyLineEntity(_thePolyLineEntity: cadex.ModelPrs_SelectedPolyLineEntity): void {}
//   visitPolyVertexEntity(thePolyVertexEntity: any) {
//     this.points?.push(/** @type {cadex.ModelData_Point} */ thePolyVertexEntity?.polyShape?.coordinate(thePolyVertexEntity?.vertexIndex));
//   }

//   visitShapeEntity(theShapeEntity: any) {
//     this.points?.push(/** @type {cadex.ModelData_Vertex} */ theShapeEntity?.shape?.point?.clone());
//   }
// }
