import { BasePanel } from './base-panel';
import cadex from '@cadexchanger/web-toolkit';
import { CustomPMISceneNode, CustomSGESceneNode, PMITreeManager } from './pmi';

/* global $ */
// declare const $: any;

/**
 * Interface for additional 'treeId' property.
 */
export interface TreeSceneNode {
  treeId?: string;
}

export interface StructurePanelConfig {
  scene: cadex.ModelPrs_Scene;
  modelSceneNode: cadex.ModelPrs_SceneNode;
  domElement: HTMLElement;
  title?: string;
  types: Record<string, { icon: string }>;
  multiSelection?: boolean;
}

export const StructurePanelDefaultConfig: Partial<StructurePanelConfig> = {
  title: 'Structure',
  types: {},
  multiSelection: true,
};

export class StructurePanel extends BasePanel {
  scene: cadex.ModelPrs_Scene;
  modelSceneNode: cadex.ModelPrs_SceneNode;
  representationMask: cadex.ModelData_RepresentationMask;
  jstree: any;

  /** Expcustom - PMI - Begin */
  sceneGraphTree: any;
  pmiTreeManager: PMITreeManager;
  viewport: cadex.ModelPrs_ViewPort;
  /** Expcustom - PMI - End */

  constructor(theConfig: StructurePanelConfig, viewport: cadex.ModelPrs_ViewPort) {
    const aConfig = Object.assign({}, StructurePanelDefaultConfig, theConfig) as Required<StructurePanelConfig>;
    super(aConfig);

    this.viewport = viewport; // Expcustom - Viewport required
    this.scene = theConfig.scene;
    this.modelSceneNode = theConfig.modelSceneNode;
    this.representationMask = cadex.ModelData_RepresentationMask.ModelData_RM_BRep;

    this.domElement.classList.add('structure-panel');
    this._panelBody.classList.add('structure-panel__tree');

    /** Expcustom - PMI - Begin */
    const aStyle = new cadex.ModelPrs_Style();
    aStyle.highlightAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0x66cc00));
    aStyle.boundariesHighlightAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0xb2ff65));
    this.modelSceneNode.style = aStyle;
    this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Node;

    const aJSTreeConfig = {
      core: {
        multiple: aConfig.multiSelection,
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

    this.pmiTreeManager = new PMITreeManager(this.scene, this.viewport, aJSTreeConfig);

    // Initialize jsTree library used for visualizing scenegraph structure (see https://www.jstree.com/)
    $(this._panelBody)
      .jstree(aJSTreeConfig)
      .on('select_node.jstree', async (_theEvent, theData) => {
        this.pmiTreeManager.loadSGENodePMI(theData.node);
        if (theData.node?.data?.representationSceneNode) {
          this.scene.selectionManager.selectNode(theData.node?.data?.representationSceneNode, false);
        }
      })
      .on('deselect_all.jstree', () => {
        this.pmiTreeManager.clear();
        this.scene.selectionManager.deselectAll(false);
      })
      .on('changed.jstree', (_theEvent, theData) => this.onSelectionChangedByTreeView(theData.selected))
      .on('activate_node.jstree', (_theEvent, theData) => this.onDisplayedChangedByTreeView(theData.node, theData.displayed));

    this.sceneGraphTree = $(this._panelBody).jstree(true);
    /** Expcustom - PMI - End */

    /** Expcustom - Structure code replaced by PMI - Begin */
    // const aJSTreeConfig = {
    //   core: {
    //     multiple: aConfig.multiSelection,
    //     check_callback: true,
    //     themes: {
    //       name: null, //'default',
    //       dots: true,
    //     }
    //   },
    //   types: aConfig.types,
    //   plugins: ['wholerow', 'types', 'sgestates']
    // };

    // this._panelBody.classList.add('structure-panel__tree');
    // // Initialize jsTree library used for visualizing scenegraph structure (see https://www.jstree.com/)
    // $(this._panelBody).jstree(aJSTreeConfig)
    //   .on('changed.jstree', (_theEvent, theData) => this.onSelectionChangedByTreeView(theData.selected))
    //   .on('activate_node.jstree', (_theEvent, theData) => this.onDisplayedChangedByTreeView(theData.node, theData.displayed));
    /** Expcustom - Structure code replaced by PMI - End */

    this.jstree = $(this._panelBody).jstree(true);

    // Subscribe to selection events
    this.scene.selectionManager.addEventListener('selectionChanged', this.onSelectionChangedByScene.bind(this));
  }

  clear() {
    //ExpCustom - PMI - Begin
    this.pmiTreeManager.reset();
    const aRootNodePMI = this.sceneGraphTree.get_node('#');
    aRootNodePMI.children.forEach((theNodeId) => this.sceneGraphTree.delete_node(theNodeId));
    //ExpCustom - PMI - End

    const aRootNode = this.jstree.get_node('#');
    this.jstree.delete_node(aRootNode.children);
  }

  private onSelectionChangedByScene(theEvent: cadex.ModelPrs_SelectionChangedEvent) {
    theEvent.added.forEach((theAdded) => {
      if (theAdded.isWholeSelectedNode) {
        const anAddedObject = theAdded.node as cadex.ModelPrs_SceneNode & TreeSceneNode;
        if (anAddedObject.treeId) {
          this.jstree.select_node(anAddedObject.treeId, true);
        }
      }

      /** PMI - Begin */
      const anAddedObject = theAdded.node as cadex.ModelPrs_SceneNode & CustomSGESceneNode & CustomPMISceneNode;
      if (anAddedObject.sgeTreeId) {
        this.sceneGraphTree.select_node(anAddedObject.sgeTreeId);
      } else if (anAddedObject.pmiTreeId) {
        this.pmiTreeManager.pmiTree.select_node(anAddedObject.pmiTreeId);
        if (anAddedObject.associatedShapesSelection && anAddedObject.combinedVisibilityMode === cadex.ModelPrs_VisibilityMode.Visible) {
          this.scene.selectionManager.select(anAddedObject.associatedShapesSelection, false);
        }
      }
      /** PMI - End */
    });
    theEvent.removed.forEach((theRemoved) => {
      if (theRemoved.isWholeSelectedNode) {
        const aRemovedObject = theRemoved.node as cadex.ModelPrs_SceneNode & TreeSceneNode;
        if (aRemovedObject.treeId) {
          this.jstree.deselect_node(aRemovedObject.treeId, true);
        }
      }

      /** PMI - Begin */
      const aRemovedObject = theRemoved.node as cadex.ModelPrs_SceneNode & CustomSGESceneNode & CustomPMISceneNode;
      if (aRemovedObject.sgeTreeId) {
        this.sceneGraphTree.deselect_node(aRemovedObject.sgeTreeId);
      } else if (aRemovedObject.pmiTreeId) {
        this.pmiTreeManager.pmiTree.deselect_node(aRemovedObject.pmiTreeId);
        if (aRemovedObject?.associatedShapesSelection) {
          this.scene.selectionManager.deselect(aRemovedObject.associatedShapesSelection);
        }
      }
      /** PMI - End */
    });

    // Handle deselectAll on click on empty space on the viewer
    if (this.scene.selectionManager.numberOfSelectedItems === 0) {
      this.jstree.deselect_all(true);

      /** PMI - Begin */
      this.sceneGraphTree.deselect_all(true);
      this.pmiTreeManager.pmiTree.deselect_all(true);
      this.scene.selectionManager.unhighlightAll();
      /** PMI - End */
    }
    // Manually notify jsTree plugins about selection change to apply tree styles.
    this.jstree.trigger('changed', {
      action: 'select_by_scene',
      selected: this.jstree.get_selected(),
    });
  }

  onSelectionChangedByTreeView(theNodeIds: string[]) {
    this.scene.selectionManager.deselectAll(false);
    theNodeIds.forEach((theNodeId) => {
      const aJstreeNode = this.jstree.get_node(theNodeId);
      this.collectGeometryJstreeNodes(aJstreeNode).forEach((thePartJstreeNode) => {
        const aSceneNode = thePartJstreeNode.data.sceneNode;
        if (aSceneNode) {
          this.scene.selectionManager.selectNode(aSceneNode, /*theBreakSelection*/ false, /*theDispatchEvent*/ false);
        }
      });
    });
    this.dispatchEvent({ type: 'selectionChanged' });
  }

  // TODO: define type more accurate
  async onDisplayedChangedByTreeView(theJstreeNode: { data: { sceneNode: cadex.ModelPrs_SceneNode | undefined } }, theDisplayed: boolean | undefined) {
    if (theDisplayed === undefined) {
      return;
    }

    this.collectGeometryJstreeNodes(theJstreeNode).forEach((theGeometryJstreeNode) => {
      if (theGeometryJstreeNode.data.sceneNode) {
        theGeometryJstreeNode.data.sceneNode.visibilityMode = theDisplayed ? cadex.ModelPrs_VisibilityMode.Visible : cadex.ModelPrs_VisibilityMode.Hidden;
      }
    });
    await this.scene.update();
  }

  /**
   * Collects nodes with geometries to select/display
   */
  // TODO: define type more accurate
  protected collectGeometryJstreeNodes(_theJstreeNode: { data: { sceneNode: cadex.ModelPrs_SceneNode | undefined } }): Array<{ data: { sceneNode: cadex.ModelPrs_SceneNode | undefined } }> {
    return [];
  }
}
