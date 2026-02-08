import { SceneGraphToTreeConverter } from './pmi';
import { StructurePanel, StructurePanelConfig, TreeSceneNode } from './structure-panel';

import cadex from '@cadexchanger/web-toolkit';

export interface CustomSceneNode {
  treeId?: string;
}

function defaultBodyName(body: cadex.ModelData_Body) {
  const bodyType = body.bodyType;
  const bodyTypeStr = Object.keys(cadex.ModelData_BodyType).find((v) => cadex.ModelData_BodyType[v] === bodyType);
  return `${bodyTypeStr} Body`;
}

function bodyName(body: cadex.ModelData_Body, rep: cadex.ModelData_BRepRepresentation) {
  let bodyName = rep.shapeName(body);
  if (!bodyName) {
    // Handle the case when the body is just another shape wrapper
    const bodyChildren = [...body];
    if (bodyChildren.length === 1) {
      bodyName = rep.shapeName(bodyChildren[0]);
    }
  }
  return bodyName || defaultBodyName(body);
}

function defaultPolyShapeName(pvs: cadex.ModelData_PolyShape) {
  if (pvs instanceof cadex.ModelData_IndexedTriangleSet) {
    return 'Triangle Set';
  } else if (pvs instanceof cadex.ModelData_PolyLineSet) {
    return 'Line Set';
  } else if (pvs instanceof cadex.ModelData_PolyPointSet) {
    return 'Point Set';
  }
  throw new Error('Unsupported Poly Vertex Set Type'); // never happens
}

export interface SGETreeItem {
  text?: string;
  type?: string;
  state?: {
    opened?: boolean;
  };
  data: {
    element?: cadex.ModelData_SceneGraphElement;
    sceneNode: cadex.ModelPrs_SceneNode;
    representationSceneNode?: cadex.ModelPrs_SceneNode | null;
    pmiTable: cadex.ModelData_PMITable | null;
  };
  typedChildren?: Record<string, SGETreeItem[]>;
  children: SGETreeItem[];
}

class SceneGraphConverter extends cadex.ModelData_SceneGraphElementVisitor {
  jstree: any;
  treeNodes: string[];
  sceneNodes: cadex.ModelPrs_SceneNode[];
  lastInstance: cadex.ModelData_Instance | null;
  sceneNodeFactory: cadex.ModelPrs_SceneNodeFactory;
  repMask: cadex.ModelData_RepresentationMask;

  constructor(theJsTree: any, theRootNodeId: string, theRepMask: cadex.ModelData_RepresentationMask, theNode: cadex.ModelPrs_SceneNode) {
    super();
    this.jstree = theJsTree;
    this.treeNodes = [theRootNodeId];
    this.sceneNodes = [theNode];
    this.lastInstance = null;
    this.sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.repMask = theRepMask;
  }
  currentTreeNode() {
    return this.treeNodes[this.treeNodes.length - 1];
  }
  currentSceneNode() {
    return this.sceneNodes[this.sceneNodes.length - 1];
  }

  addSceneNode(theElement: cadex.ModelData_SceneGraphElement, theAddToStack: boolean) {
    const aSceneNode = this.sceneNodeFactory.createNodeFromSceneGraphElement(theElement);
    this.currentSceneNode().addChildNode(aSceneNode);
    if (theAddToStack) {
      this.sceneNodes.push(aSceneNode);
    }
    return aSceneNode;
  }

  override async visitPart(thePart: cadex.ModelData_Part) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const aPartNode = this.addSceneNode(thePart, false);
    let aRepresentationNode: cadex.ModelPrs_SceneNode | null = null;
    const aRepresentation = thePart.representation(this.repMask);
    // if (aRepresentation) {
    //   aRepresentationNode = this.sceneNodeFactory.createNodeFromRepresentation(aRepresentation);
    //   aPartNode.addChildNode(aRepresentationNode);
    // }

    const aSceneNode = anInstanceNode || aPartNode;

    const aTreeItem: SGETreeItem = {
      text: this.lastInstance?.name || thePart.name || 'Unnamed Part',
      type: 'part',
      data: {
        element: this.lastInstance || thePart,
        sceneNode: aSceneNode,
        representationSceneNode: aRepresentationNode,
        pmiTable: this.lastInstance?.pmi || thePart.pmi,
      },
      children: [],
    };
    const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
    this.jstree.loading_node(aNodeId);

    /** ExpCustom - Begin */
    if (aRepresentation instanceof cadex.ModelData_BRepRepresentation) {
      aRepresentationNode = new cadex.ModelPrs_SceneNode();
      for (const body of await aRepresentation.bodyList()) {
        const bodyNode = this.sceneNodeFactory.createNodeFromBody(body, aRepresentation) as cadex.ModelPrs_SceneNode & CustomSceneNode;
        aPartNode.addChildNode(bodyNode);
        const bodyTreeItem = {
          text: bodyName(body, aRepresentation),
          type: defaultBodyName(body).toLowerCase(),
          data: {
            sge: this.lastInstance || thePart,
            representation: aRepresentation,
            body,
            sceneNode: bodyNode,
          },
        };
        bodyNode.treeId = this.jstree.create_node(aNodeId, bodyTreeItem);
        this.jstree.display_node(bodyNode.treeId);
      }
      aPartNode.addChildNode(aRepresentationNode);
    } else if (aRepresentation instanceof cadex.ModelData_PolyRepresentation) {
      aRepresentationNode = new cadex.ModelPrs_SceneNode();
      for (const pvs of await aRepresentation.polyShapeList()) {
        const pvsNode = this.sceneNodeFactory.createNodeFromPolyVertexSet(pvs) as cadex.ModelPrs_SceneNode & CustomSceneNode;
        aRepresentationNode.addChildNode(pvsNode);
        const defPVSName = defaultPolyShapeName(pvs);
        const pvsTreeItem = {
          text: pvs.name || defPVSName,
          type: defPVSName.toLowerCase(),
          data: {
            sge: this.lastInstance || thePart,
            representation: aRepresentation,
            pvs,
            sceneNode: pvsNode,
            geometry: pvsNode.geometry,
          },
        };
        pvsNode.treeId = this.jstree.create_node(aNodeId, pvsTreeItem);
        this.jstree.display_node(pvsNode.treeId);
      }
      aPartNode.addChildNode(aRepresentationNode);
    }
    /** ExpCustom - End */

    (aSceneNode as cadex.ModelPrs_SceneNode & TreeSceneNode).treeId = aNodeId;
    if (aRepresentationNode) {
      (aRepresentationNode as cadex.ModelPrs_SceneNode & TreeSceneNode).treeId = aNodeId;
      // this.jstree.loading_node(aNodeId);
    }

    const aGeometry = aRepresentationNode && aRepresentationNode.geometry;
    if (aGeometry) {
      aGeometry.addEventListener('stateChanged', () => {
        switch (aGeometry.state) {
          case cadex.ModelPrs_GeometryState.Loading:
            this.jstree.loading_node(aNodeId);
            break;
          case cadex.ModelPrs_GeometryState.Completed:
            this.jstree.display_node(aNodeId);
            break;
          case cadex.ModelPrs_GeometryState.Failed:
            this.jstree.error_node(aNodeId);
            break;
          default:
            break;
        }
      });
    }
  }

  override visitInstanceEnter(theInstance: cadex.ModelData_Instance) {
    this.lastInstance = theInstance;
    this.addSceneNode(theInstance, true);
    return true;
  }

  override visitInstanceLeave(_theInstance: cadex.ModelData_Instance) {
    this.lastInstance = null;
    this.sceneNodes.pop();
  }

  override visitAssemblyEnter(theAssembly: cadex.ModelData_Assembly) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const anAssemblyNode = this.addSceneNode(theAssembly, true);
    const aSceneNode = anInstanceNode || anAssemblyNode;

    const aTreeItem: SGETreeItem = {
      text: this.lastInstance?.name || theAssembly.name || 'Unnamed Assembly',
      type: 'assembly',
      state: {
        opened: this.treeNodes.length === 1, // open root assemblies
      },
      data: {
        element: this.lastInstance || theAssembly,
        sceneNode: aSceneNode,
        pmiTable: this.lastInstance?.pmi || theAssembly.pmi,
      },
      children: [],
    };
    const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
    (aSceneNode as cadex.ModelPrs_SceneNode & TreeSceneNode).treeId = aNodeId;
    this.treeNodes.push(aNodeId);

    return true;
  }

  override visitAssemblyLeave(_theAssembly: cadex.ModelData_Assembly) {
    this.treeNodes.pop();
    this.sceneNodes.pop();
  }
}

export interface MCADStructurePanelConfig extends Omit<StructurePanelConfig, 'types'> {}

export const MCADStructurePanelDefaultConfig: Partial<MCADStructurePanelConfig> = {
  title: 'Structure',
};

export class MCADStructurePanel extends StructurePanel {
  constructor(theConfig: MCADStructurePanelConfig, viewport: cadex.ModelPrs_ViewPort) {
    const aConfig = Object.assign(
      {
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
      },
      MCADStructurePanelDefaultConfig,
      theConfig
    ) as Required<StructurePanelConfig>;
    super(aConfig, viewport); // Expcustom - Viewport required
  }

  selectedSceneGraphElements() {
    const anElements: cadex.ModelData_SceneGraphElement[] = [];
    for (const aSelectedItem of this.scene.selectionManager.selectedItems()) {
      const aSelectedNode = aSelectedItem.node as cadex.ModelPrs_SceneNode & TreeSceneNode;
      if (aSelectedNode.treeId) {
        const aNode = this.jstree.get_node(aSelectedNode.treeId) as SGETreeItem;
        if (aNode.data.element) {
          anElements.push(aNode.data.element);
        }
      }
    }
    return anElements;
  }

  async clear1() {
    const aRootNode = this.sceneGraphTree.get_node('#');
    aRootNode.children.forEach((theNodeId) => this.sceneGraphTree.delete_node(theNodeId));
  }

  /** Structure tree load */
  async loadModel(theModel: cadex.ModelData_Model, theModelName: string) {
    await this.clear1(); // ExpCustom
    // Create root file item
    const aFileNodeId = this.jstree.create_node('#', {
      text: theModelName,
      type: 'file',
      data: {},
    });

    const aVisitor = new SceneGraphConverter(this.jstree, aFileNodeId, this.representationMask, this.modelSceneNode);
    await theModel.accept(aVisitor);

    // this.jstree.open_node(aFileNodeId);
    this.jstree.open_all(null, 0);
  }

  /** Expcustom - PMI tree load */
  async loadPMIModel(theModel: cadex.ModelData_Model, theModelName: string) {
    // Create root file item
    const aFileNodeId = this.sceneGraphTree.create_node('#', {
      text: theModelName,
      type: 'file',
      data: {},
    });

    const aVisitor = new SceneGraphToTreeConverter(this.sceneGraphTree, aFileNodeId, this.representationMask, this.modelSceneNode);
    await theModel.accept(aVisitor);

    this.sceneGraphTree.open_all(null, 0);
  }

  protected override collectGeometryJstreeNodes(theJstreeNode) {
    if (theJstreeNode.type === 'part') {
      return [theJstreeNode];
    } else {
      return theJstreeNode.children_d.reduce((thePartNodes, theChildId) => {
        const aChild = this.jstree.get_node(theChildId);
        if (aChild.type === 'part') {
          thePartNodes.push(aChild);
        }
        return thePartNodes;
      }, []);
    }
  }
}
