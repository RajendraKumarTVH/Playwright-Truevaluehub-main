import cadex from '@cadexchanger/web-toolkit';

declare const $: any;

/**
 * Interface for additional 'treeId' property.
 */
export interface CustomSGESceneNode {
  sgeTreeId?: string;
}

/**
 * Interface for additional properties of PMI scene nodes.
 */
export interface CustomPMISceneNode {
  pmiTreeId?: string;
  name: string;
  type: string;
  associatedShapes?: cadex.ModelData_Shape[];
  associatedShapesSelection?: cadex.ModelPrs_SelectionItem;
}

/**
 * Template interface for grouped PMI data.
 */
export interface GroupedPMIData<T> {
  groupId: T;
  nodes: (cadex.ModelPrs_SceneNode & CustomPMISceneNode)[];
}

/**
 * Interface for PMI scene data.
 */
export interface PMISceneData {
  sceneNodes: (cadex.ModelPrs_SceneNode & CustomPMISceneNode)[];
  sceneNodesByType: GroupedPMIData<string>[];
  sceneNodesBySavedViews: GroupedPMIData<cadex.ModelData_PMISavedView>[];
}

/**
 * Interface for Jstree SGE node data.
 */
export interface JstreeSGENodeData {
  sge: cadex.ModelData_SceneGraphElement;
  pmiTable: cadex.ModelData_PMITable | null;
  sceneNode: cadex.ModelPrs_SceneNode & CustomSGESceneNode;
  representationSceneNode?: cadex.ModelPrs_SceneNode & CustomSGESceneNode;
  pmiSceneData?: PMISceneData;
}

/**
 * Interface for Jstree SGE node.
 */
export interface JstreeSGENode {
  text: string;
  type: string;
  data: JstreeSGENodeData;
}

export class PMITreeManager {
  scene: cadex.ModelPrs_Scene;
  viewport: cadex.ModelPrs_ViewPort;

  pmiTree: any;
  activeSGETreeNode: JstreeSGENode | null = null;

  savedViewsDropDown: HTMLSelectElement;
  pmiSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
  pmiSceneNodeAppearance = new cadex.ModelData_Appearance(new cadex.ModelData_ColorObject(0, 0, 0));
  pmiSceneNodeStyle = new cadex.ModelPrs_Style();

  constructor(theScene: cadex.ModelPrs_Scene, theViewport: cadex.ModelPrs_ViewPort, theJsTreeConfig: Record<string, unknown>) {
    this.scene = theScene;
    this.viewport = theViewport;

    // Initialize jsTree library used for visualizing tree structure (see https://www.jstree.com/)
    $('#file-pmi-elements')
      .jstree(theJsTreeConfig)
      .on('select_node.jstree', async (_theEvent, theData) => {
        const aNodeData = theData.node?.data;
        if (aNodeData && aNodeData.sceneNode) {
          this.scene.selectionManager.selectNode(aNodeData.sceneNode, /*break selection*/ false);
        }
      })
      .on('deselect_all.jstree', () => {
        this.activeSGETreeNode?.data.pmiSceneData?.sceneNodes.forEach((theNode) => this.scene.selectionManager.deselectNode(theNode));
      });

    this.pmiTree = $('#file-pmi-elements').jstree(true);

    this.savedViewsDropDown = document.getElementById('file-pmi-saved-views-select') as HTMLSelectElement;
    this.savedViewsDropDown.onchange = this.onSavedViewChanged.bind(this);

    // PMI entities will use flat shading for highlighting and selecting, if the parent nodes don't specify otherwise.
    this.pmiSceneNodeStyle.highlightAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0x64a0e2));
    this.pmiSceneNodeStyle.selectionAppearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0x226daa));

    this.clear();
  }

  reset() {
    // Recreate factory to release data cache stored by factory.
    this.pmiSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.clear();
  }

  /**
   * Loads PMI data items and convert it to scene nodes tree.
   */
  async convertPMITable(thePMITable: cadex.ModelData_PMITable, theBrepRep?: cadex.ModelData_BRepRepresentation, theBRepRepNode?: cadex.ModelPrs_SceneNode): Promise<PMISceneData> {
    const aPMIDataItems = await thePMITable.pmiDataItems();
    const aGraphicalElementToSceneNodeMap: Map<cadex.ModelData_PMIGraphicalElement, cadex.ModelPrs_SceneNode & CustomPMISceneNode> = new Map();
    const aSceneNodesByTypeMap: Map<string, Array<cadex.ModelPrs_SceneNode & CustomPMISceneNode>> = new Map();
    const aPMIAssociations: Map<cadex.ModelData_PMIData, Array<cadex.ModelData_Shape>> = new Map();
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
      let aNode: cadex.ModelPrs_SceneNode & CustomPMISceneNode;
      if (thePMIData.graphicalElement) {
        aNode = this.pmiSceneNodeFactory.createNodeFromPMIGraphicalElement(thePMIData.graphicalElement) as cadex.ModelPrs_SceneNode & CustomPMISceneNode;
        aNode.appearance = this.pmiSceneNodeAppearance;
        aNode.style = this.pmiSceneNodeStyle;
        aGraphicalElementToSceneNodeMap.set(thePMIData.graphicalElement, aNode);
      } else {
        aNode = new cadex.ModelPrs_SceneNode() as cadex.ModelPrs_SceneNode & CustomPMISceneNode;
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

    const aSceneNodesByType = Array.from(aSceneNodesByTypeMap, ([groupId, nodes]) => ({ groupId, nodes })).sort((a, b) => a.groupId.localeCompare(b.groupId));

    const aSavedViews = await thePMITable.views();
    const aSceneNodesBySavedViews = aSavedViews.map((theSavedView) => {
      const aSceneNodes: (cadex.ModelPrs_SceneNode & CustomPMISceneNode)[] = [];
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

  async loadSGENodePMI(theNode: JstreeSGENode) {
    this.clear(false);

    const aNodeData = theNode.data;
    if (aNodeData.pmiTable) {
      if (!aNodeData.pmiSceneData) {
        let aBRepRep: cadex.ModelData_BRepRepresentation | undefined;
        let aBRepRepNode: (cadex.ModelPrs_SceneNode & CustomSGESceneNode) | undefined;
        if (aNodeData.representationSceneNode && aNodeData.sge instanceof cadex.ModelData_Part) {
          aBRepRep = aNodeData.sge.brepRepresentation();
          if (aBRepRep) {
            aBRepRepNode = aNodeData.representationSceneNode;
          }
        }
        aNodeData.pmiSceneData = await this.convertPMITable(aNodeData.pmiTable, aBRepRep, aBRepRepNode);
        aNodeData.pmiSceneData.sceneNodes.forEach((theNode) => aNodeData.sceneNode.addChildNode(theNode));
      }

      this.activeSGETreeNode = theNode;

      const aSGNode = this.pmiTree.create_node(null, {
        text: theNode.text,
        type: theNode.type,
        data: aNodeData,
      });

      // Feed PMI elements tree
      aNodeData.pmiSceneData.sceneNodesByType.forEach((theGroup) => {
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

      aNodeData.pmiSceneData.sceneNodesBySavedViews.forEach((theGroup) => {
        const anOption = document.createElement('option');
        anOption.text = theGroup.groupId.name || 'Unnamed';
        this.savedViewsDropDown.add(anOption);
      });
      this.savedViewsDropDown.selectedIndex = -1;
    } else {
      this.activeSGETreeNode = null;
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

  onSavedViewChanged() {
    const aPMIData = this.activeSGETreeNode?.data.pmiSceneData;
    if (!aPMIData) {
      return;
    }
    if (this.savedViewsDropDown.selectedIndex === 0) {
      aPMIData.sceneNodes.forEach((theNode) => {
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Visible;
        this.pmiTree.enable_node(theNode.pmiTreeId);
      });
    } else if (this.savedViewsDropDown.selectedIndex > 0) {
      aPMIData.sceneNodes.forEach((theNode) => {
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Hidden;
        this.pmiTree.disable_node(theNode.pmiTreeId);
      });

      const aSelectedViewData = aPMIData.sceneNodesBySavedViews[this.savedViewsDropDown.selectedIndex - 1];
      aSelectedViewData.nodes.forEach((theNode) => {
        this.pmiTree.enable_node(theNode.pmiTreeId);
        theNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Visible;
      });
      const aSavedViewCamera = aSelectedViewData.groupId.camera;
      if (aSavedViewCamera) {
        const aSGENodeTransformation = this.activeSGETreeNode?.data.sceneNode.combinedTransformation || new cadex.ModelData_Transformation();
        this.viewport.camera.set(
          aSavedViewCamera.location.transformed(aSGENodeTransformation),
          aSavedViewCamera.targetPoint.transformed(aSGENodeTransformation),
          aSavedViewCamera.upDirection.transformed(aSGENodeTransformation)
        );
      }
    }
    this.scene.update();
  }

  clear(theToAddNoteNode: boolean = true) {
    const aTreeRoot = this.pmiTree.get_node('#');
    aTreeRoot.children.forEach((theRoot) => this.pmiTree.delete_node(theRoot));
    while (this.savedViewsDropDown.options.length > 0) {
      this.savedViewsDropDown.remove(0);
    }
    if (this.activeSGETreeNode) {
      this.activeSGETreeNode.data.pmiSceneData?.sceneNodes.forEach((thePMISceneNode) => {
        thePMISceneNode.visibilityMode = cadex.ModelPrs_VisibilityMode.Hidden;
      });
      this.activeSGETreeNode = null;
    }
    if (theToAddNoteNode) {
      this.pmiTree.create_node(null, { text: 'Select tree node to see PMI data', type: 'pmi' });
    }
  }
}

export class SceneGraphToTreeConverter extends cadex.ModelData_SceneGraphElementVisitor {
  jstree: any;
  treeNodesStack: string[];
  sceneNodesStack: (cadex.ModelPrs_SceneNode & CustomSGESceneNode)[];
  lastInstance: cadex.ModelData_Instance | null;
  sceneNodeFactory: cadex.ModelPrs_SceneNodeFactory;
  repMask: cadex.ModelData_RepresentationMask;

  constructor(theJsTree: any, theRootNodeId: string, theRepMask: cadex.ModelData_RepresentationMask, theNode: cadex.ModelPrs_SceneNode) {
    super();
    this.jstree = theJsTree;
    this.treeNodesStack = [theRootNodeId];
    this.sceneNodesStack = [theNode];
    this.lastInstance = null;
    this.sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.repMask = theRepMask;
  }
  currentTreeNode() {
    return this.treeNodesStack[this.treeNodesStack.length - 1];
  }
  currentSceneNode() {
    return this.sceneNodesStack[this.sceneNodesStack.length - 1];
  }

  addSceneNode(theElement: cadex.ModelData_SceneGraphElement, theAddToStack: boolean) {
    const aSceneNode = this.sceneNodeFactory.createNodeFromSceneGraphElement(theElement) as cadex.ModelPrs_SceneNode & CustomSGESceneNode;
    this.currentSceneNode().addChildNode(aSceneNode);
    if (theAddToStack) {
      this.sceneNodesStack.push(aSceneNode);
    }
    return aSceneNode;
  }

  override visitPart(thePart: cadex.ModelData_Part) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const aPartNode = this.addSceneNode(thePart, false);
    let aRepresentationNode: (cadex.ModelPrs_SceneNode & CustomSGESceneNode) | undefined;
    const aRepresentation = thePart.representation(this.repMask);
    if (aRepresentation) {
      aRepresentationNode = this.sceneNodeFactory.createNodeFromRepresentation(aRepresentation) as cadex.ModelPrs_SceneNode & CustomSGESceneNode;
      aPartNode.addChildNode(aRepresentationNode);
    }

    const aSceneNode = anInstanceNode || aPartNode;

    const aTreeItem: JstreeSGENode = {
      text: this.lastInstance?.name || thePart.name || 'Unnamed Part',
      type: 'part',
      data: {
        sge: this.lastInstance || thePart,
        sceneNode: aSceneNode,
        representationSceneNode: aRepresentationNode,
        pmiTable: this.lastInstance?.pmi || thePart.pmi,
      },
    };
    const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
    aSceneNode.sgeTreeId = aNodeId;
    if (aRepresentationNode) {
      aRepresentationNode.sgeTreeId = aNodeId;
    }
  }

  override visitInstanceEnter(theInstance: cadex.ModelData_Instance) {
    this.lastInstance = theInstance;
    this.addSceneNode(theInstance, true);
    return true;
  }

  override visitInstanceLeave(_theInstance: cadex.ModelData_Instance) {
    this.lastInstance = null;
    this.sceneNodesStack.pop();
  }

  override visitAssemblyEnter(theAssembly: cadex.ModelData_Assembly) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const anAssemblyNode = this.addSceneNode(theAssembly, true);
    const aSceneNode = anInstanceNode || anAssemblyNode;

    const aTreeItem: JstreeSGENode = {
      text: this.lastInstance?.name || theAssembly.name || 'Unnamed Assembly',
      type: 'assembly',
      data: {
        sge: this.lastInstance || theAssembly,
        sceneNode: aSceneNode,
        pmiTable: this.lastInstance?.pmi || theAssembly.pmi,
      },
    };
    const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
    aSceneNode.sgeTreeId = aNodeId;
    this.treeNodesStack.push(aNodeId);

    return true;
  }

  override visitAssemblyLeave(_theAssembly: cadex.ModelData_Assembly) {
    this.treeNodesStack.pop();
    this.sceneNodesStack.pop();
  }
}
