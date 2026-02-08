// import { ThemeService } from 'ng2-charts';
import { ModelAnalyzer } from '../helpers';
import {
  // TreeSceneNode,
  StructurePanel,
  // StructurePanelConfig,
} from './structure-panel';

import cadex from '@cadexchanger/web-toolkit';
import { ProgressStatusManager } from '../ProgressStatusManager';

/**
 * @typedef SGETreeItem
 * @property {string} [text]
 * @property {string} [type]
 * @property {Object} [state]
 * @property {boolean} [state.opened]
 * @property {Object} data
 * @property {cadex.ModelData_SceneGraphElement} [data.element]
 * @property {cadex.ModelPrs_SceneNode} data.sceneNode
 * @property {Record<string, Array<SGETreeItem>>} [typedChildren]
 * @property {Array<SGETreeItem>} children
 */
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

class SceneGraphConverter extends cadex.ModelData_SceneGraphElementVisitor {
  /**
   * @param {any} theJsTree
   * @param {string} theRootNodeId
   * @param {cadex.ModelData_RepresentationMask} theRepMask
   * @param {cadex.ModelPrs_SceneNode} theNode
   */
  jstree: any;
  treeNodes: any;
  sceneNodes: any;
  lastInstance: any;
  sceneNodeFactory: any;
  repMask: any;
  exploreBodies: boolean = true;
  constructor(theJsTree, theRootNodeId, theRepMask, theNode, exploreBodies1: boolean) {
    super();
    this.jstree = theJsTree;
    this.treeNodes = [theRootNodeId];
    this.sceneNodes = [theNode];
    /** @type {cadex.ModelData_Instance|null} */
    this.lastInstance = null;
    this.sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.repMask = theRepMask;
    this.exploreBodies = exploreBodies1;
  }
  currentTreeNode() {
    return this.treeNodes[this.treeNodes.length - 1];
  }
  currentSceneNode() {
    return this.sceneNodes[this.sceneNodes.length - 1];
  }

  /**
   * @param {!cadex.ModelData_SceneGraphElement} theElement
   * @param {boolean} theAddToStack
   * @returns {cadex.ModelPrs_SceneNode & CustomSGESceneNode}
   */
  addSceneNode(theElement, theAddToStack) {
    const aSceneNode = /** @type {cadex.ModelPrs_SceneNode & CustomSGESceneNode} */ this.sceneNodeFactory.createNodeFromSceneGraphElement(theElement);
    this.currentSceneNode().addChildNode(aSceneNode);
    if (theAddToStack) {
      this.sceneNodes.push(aSceneNode);
    }
    return aSceneNode;
  }
  /**
   * @override
   * @param {!cadex.ModelData_Part} thePart
   */
  async visitPart(thePart) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const aPartNode = this.addSceneNode(thePart, false);
    let aRepresentationNode;

    let aRepresentation = thePart.representation(this.repMask);
    /* ExpCustom */
    const aHasBRepRep = Boolean(thePart.brepRepresentation());
    if (aHasBRepRep) {
      // brep is true
      aRepresentation = thePart.representation(cadex.ModelData_RepresentationMask.ModelData_RM_BRep);
    }
    /* ExpCustom */
    // if (aRepresentation) {
    //   aRepresentationNode = /** @type {cadex.ModelPrs_SceneNode & CustomSGESceneNode}> */(this.sceneNodeFactory.createNodeFromRepresentation(aRepresentation));
    //   aPartNode.addChildNode(aRepresentationNode);
    // }

    const aSceneNode = anInstanceNode || aPartNode;

    /** @type {SGETreeItem} */
    const aTreeItem = {
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
    aSceneNode.sgeTreeId = aNodeId;
    this.jstree.loading_node(aNodeId);

    if (this.exploreBodies) {
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
          this.jstree.display_node(pvsNode.treeId); // Expcustom fix
        }
        aPartNode.addChildNode(aRepresentationNode);
      }
      /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aSceneNode.treeId = aNodeId;
      if (aRepresentationNode) {
        /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aRepresentationNode.treeId = aNodeId;
        aRepresentationNode.sgeTreeId = aNodeId;
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
    } else {
      /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aSceneNode.treeId = aNodeId;
      if (aRepresentationNode) {
        /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aRepresentationNode.treeId = aNodeId;
        aRepresentationNode.sgeTreeId = aNodeId;
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
  }

  /**
   * @override
   * @param {!cadex.ModelData_Instance} theInstance
   */
  visitInstanceEnter(theInstance) {
    this.lastInstance = theInstance;
    this.addSceneNode(theInstance, true);
    return true;
  }
  /**
   * @override
   * @param {!cadex.ModelData_Instance} _theInstance
   */
  visitInstanceLeave(_theInstance) {
    this.lastInstance = null;
    this.sceneNodes.pop();
  }
  /**
   * @override
   * @param {!cadex.ModelData_Assembly} theAssembly
   */
  visitAssemblyEnter(theAssembly) {
    const anInstanceNode = this.lastInstance && this.currentSceneNode();
    const anAssemblyNode = this.addSceneNode(theAssembly, true);
    const aSceneNode = anInstanceNode || anAssemblyNode;

    /** @type {SGETreeItem} */
    const aTreeItem = {
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
    /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aSceneNode.treeId = aNodeId;
    aSceneNode.sgeTreeId = aNodeId;
    this.treeNodes.push(aNodeId);

    return true;
  }
  /**
   * @override
   * @param {!cadex.ModelData_Assembly} _theAssembly
   */
  visitAssemblyLeave(_theAssembly) {
    this.treeNodes.pop();
    this.sceneNodes.pop();
  }
}

/**
 * @typedef {Omit<StructurePanelConfig, "types">}
 */
export let MCADStructurePanelConfig;

/**
 * @type {Partial<MCADStructurePanelConfig>}
 */
export const MCADStructurePanelDefaultConfig = {
  title: 'Structure',
};

export class MCADStructurePanel extends StructurePanel {
  /**
   * @param {MCADStructurePanelConfig} theConfig
   */
  fitAllMargins: cadex.ModelPrs_ViewportPaddings | number = 5;
  hasBRepRep = false;
  disposed = false;
  private psb: ProgressStatusManager;
  constructor(theConfig) {
    const aConfig = /** @type {Required<StructurePanelConfig>} */ Object.assign(
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
    );
    super(aConfig);
    // super(aConfig, theConfig.viewport); // Expcustom - Viewport required
  }

  selectedSceneGraphElements() {
    const anElements = [];
    for (const aSelectedItem of this.scene.selectionManager.selectedItems()) {
      const aSelectedNode = /** @type {cadex.ModelPrs_SceneNode & TreeSceneNode} */ aSelectedItem.node;
      // const aSelectedNode = aSelectedItem.node as cadex.ModelPrs_SceneNode & TreeSceneNode; // Expcustom
      if (aSelectedNode.treeId) {
        const aNode = /** @type {SGETreeItem} */ this.jstree.get_node(aSelectedNode.treeId);
        if (aNode.data.element) {
          anElements.push(aNode.data.element);
        }
      }
    }
    return anElements;
  }

  // async clear1(theProgressScope: cadex.Base_ProgressScope) {
  //   const aRootNode = this.sceneGraphTree.get_node('#');
  //   aRootNode.children.forEach((theNodeId) => this.sceneGraphTree.delete_node(theNodeId));
  // }
  /**
   * @param {cadex.ModelData_Model} theModel
   * @param {string} theModelName
   */
  async loadModel(theModel, theModelName, progressScope) {
    // await this.clear1(new cadex.Base_ProgressScope(progressScope, 1)); // Expcustom fix
    //  const aProgressScope = this.psb.init().rootScope;
    // Create root file item
    const aFileNodeId = this.jstree.create_node('#', {
      text: theModelName,
      type: 'file',
      data: {},
    });

    const aModelAnalyser = new ModelAnalyzer();
    await theModel.accept(new cadex.ModelData_SceneGraphElementUniqueVisitor(aModelAnalyser));
    this.hasBRepRep = aModelAnalyser.hasBRepRep;

    this.jstree.loading_node(aFileNodeId); // Expcustom fix

    this.modelSceneNode.displayMode = this.hasBRepRep ? cadex.ModelPrs_DisplayMode.ShadedWithBoundaries : cadex.ModelPrs_DisplayMode.Shaded;

    const aVisitor = new SceneGraphConverter(this.jstree, aFileNodeId, this.representationMask, this.modelSceneNode, true);
    // await theModel.accept(aVisitor);

    // this.jstree.open_node(aFileNodeId);

    // Feed tree with model structure
    //const aVisitor = new SceneGraphToTreeConverter(this.sceneGraphTree, aFileNodeId, cadex.ModelData_RepresentationMask.ModelData_RM_Any, this.modelSceneNode, this.exploreBodies);
    await theModel.accept(aVisitor);
    // this.jstree.open_all(null, 0); // don't open all nodes

    await this.updateSceneSmoothly(new cadex.Base_ProgressScope(progressScope));
  }

  /** Expcustom - PMI tree load */
  async loadPMIModel(theModel: cadex.ModelData_Model, theModelName: string, progressScope) {
    // Create root file item
    const aFileNodeId = this.sceneGraphTree.create_node('#', {
      text: theModelName,
      type: 'file',
      data: {},
    });

    // this.modelSceneNode.displayMode = this.hasBRepRep ? cadex.ModelPrs_DisplayMode.ShadedWithBoundaries : cadex.ModelPrs_DisplayMode.Shaded;

    const aVisitor = new SceneGraphConverter(this.sceneGraphTree, aFileNodeId, this.representationMask, this.modelSceneNode, true);
    // const aVisitor = new SceneGraphToTreeConverter(this.sceneGraphTree, aFileNodeId, this.representationMask, this.modelSceneNode);
    await theModel.accept(aVisitor);
    // this.sceneGraphTree.open_all(null, 0); // don't open all nodes
    await this.updateSceneSmoothly(new cadex.Base_ProgressScope(progressScope));
  }

  async updateSceneSmoothly(theProgressScope: cadex.Base_ProgressScope | undefined) {
    if (this.disposed || theProgressScope?.owner.wasCanceled()) {
      return;
    }
    // Fit all camera ~3 times per second
    let aLastBBoxChangedTime = 0;
    const onSceneBBoxChanged = () => {
      const aCurrentTime = new Date().getTime();
      if (aCurrentTime - aLastBBoxChangedTime > 300) {
        aLastBBoxChangedTime = aCurrentTime;
        this.fitAll();
      }
    };
    this.scene.addEventListener('boundingBoxChanged', onSceneBBoxChanged);

    try {
      // Update scene to apply changes.
      await this.scene.update(theProgressScope);
    } finally {
      this.scene.removeEventListener('boundingBoxChanged', onSceneBBoxChanged);
    }
  }

  fitAll() {
    this.viewport.fitAll(this.fitAllMargins);
  }

  /**
   * @override
   * @protected
   * @param {Object} theJstreeNode
   * @returns {Array<Object>}
   */
  collectGeometryJstreeNodes(theJstreeNode) {
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

// class SceneGraphToTreeConverter extends cadex.ModelData_SceneGraphElementVisitor {
//   // TODO: define type
//   jstree: any;
//   treeNodes: any;
//   sceneNodes: any;
//   lastInstance: any;
//   sceneNodeFactory: any;
//   repMask: any;
//   constructor(theJsTree, theRootNodeId, theRepMask, theNode) {
//     super();
//     this.jstree = theJsTree;
//     this.treeNodes = [theRootNodeId];
//     this.sceneNodes = [theNode];
//     this.lastInstance = null;
//     this.sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
//     this.repMask = theRepMask;
//   }
//   currentTreeNode() {
//     return this.treeNodes[this.treeNodes.length - 1];
//   }
//   currentSceneNode() {
//     return this.sceneNodes[this.sceneNodes.length - 1];
//   }
//   addSceneNode(theElement, theAddToStack) {
//     const aSceneNode = this.sceneNodeFactory.createNodeFromSceneGraphElement(theElement);
//     this.currentSceneNode().addChildNode(aSceneNode);
//     if (theAddToStack) {
//       this.sceneNodes.push(aSceneNode);
//     }
//     return aSceneNode;
//   }
//   visitPart(thePart) {
//     const anInstanceNode = this.lastInstance && this.currentSceneNode();
//     const aPartNode = this.addSceneNode(thePart, false);
//     let aRepresentationNode;
//     const aRepresentation = thePart.representation(this.repMask);
//     if (aRepresentation) {
//       aRepresentationNode = this.sceneNodeFactory.createNodeFromRepresentation(aRepresentation);
//       aPartNode.addChildNode(aRepresentationNode);
//     }
//     const aSceneNode = anInstanceNode || aPartNode;
//     const aTreeItem = {
//       text: this.lastInstance?.name || thePart.name || 'Unnamed Part',
//       type: 'part',
//       data: {
//         sge: this.lastInstance || thePart,
//         sceneNode: aSceneNode,
//       },
//     };
//     const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
//     // this.jstree.loading_node(aNodeId); // Expcustom
//     aSceneNode.treeId = aNodeId;
//     if (aRepresentationNode) {
//       aRepresentationNode.treeId = aNodeId;
//     }
//     const aGeometry = aRepresentationNode && aRepresentationNode.geometry;
//     if (aGeometry) {
//       aGeometry.addEventListener('stateChanged', () => {
//         switch (aGeometry.state) {
//           case cadex.ModelPrs_GeometryState.Loading:
//             this.jstree.loading_node(aNodeId);
//             break;
//           case cadex.ModelPrs_GeometryState.Completed:
//             this.jstree.display_node(aNodeId);
//             break;
//           case cadex.ModelPrs_GeometryState.Failed:
//             this.jstree.error_node(aNodeId);
//             break;
//           default:
//             break;
//         }
//       });
//     }
//   }
//   visitInstanceEnter(theInstance) {
//     this.lastInstance = theInstance;
//     this.addSceneNode(theInstance, true);
//     return true;
//   }
//   visitInstanceLeave(_theInstance) {
//     this.lastInstance = null;
//     this.sceneNodes.pop();
//   }
//   visitAssemblyEnter(theAssembly) {
//     const anInstanceNode = this.lastInstance && this.currentSceneNode();
//     const anAssemblyNode = this.addSceneNode(theAssembly, true);
//     const aSceneNode = anInstanceNode || anAssemblyNode;
//     const aTreeItem = {
//       text: this.lastInstance?.name || theAssembly.name || 'Unnamed Assembly',
//       type: 'assembly',
//       data: {
//         sge: this.lastInstance || theAssembly,
//         sceneNode: aSceneNode,
//       },
//     };
//     const aNodeId = this.jstree.create_node(this.currentTreeNode(), aTreeItem);
//     aSceneNode.treeId = aNodeId;
//     this.treeNodes.push(aNodeId);
//     return true;
//   }
//   visitAssemblyLeave(_theAssembly) {
//     this.treeNodes.pop();
//     this.sceneNodes.pop();
//   }
// }
