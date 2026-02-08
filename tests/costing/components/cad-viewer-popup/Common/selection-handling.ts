import cadex from '@cadexchanger/web-toolkit';

export interface CustomSceneNode {
  sge?: cadex.ModelData_SceneGraphElement | null;
  representation?: cadex.ModelData_Representation | null;
  name?: string | null;
}

export class SceneGraphConverter extends cadex.ModelData_SceneGraphElementVisitor {
  sceneNodes: cadex.ModelPrs_SceneNode[];
  lastInstance: cadex.ModelData_Instance | null;
  sceneNodeFactory: cadex.ModelPrs_SceneNodeFactory;
  repMask: cadex.ModelData_RepresentationMask;

  constructor(theRepMask: cadex.ModelData_RepresentationMask, theNode: cadex.ModelPrs_SceneNode) {
    super();
    this.sceneNodes = [theNode];
    this.lastInstance = null;
    this.sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this.repMask = theRepMask;
  }

  addSceneNode(theElement: cadex.ModelData_SceneGraphElement, theAddToStack: boolean) {
    const aNode = this.sceneNodeFactory.createNodeFromSceneGraphElement(theElement) as cadex.ModelPrs_SceneNode & CustomSceneNode;
    this.sceneNodes[this.sceneNodes.length - 1].addChildNode(aNode);
    aNode.sge = theElement;
    if (theAddToStack) {
      this.sceneNodes.push(aNode);
    }
    return aNode;
  }

  override visitPart(thePart: cadex.ModelData_Part) {
    const aPartNode = this.addSceneNode(thePart, false);
    aPartNode.name = this.lastInstance?.name || thePart.name;
    this.sceneNodes[this.sceneNodes.length - 1].addChildNode(aPartNode);

    let aRepresentationNode: (cadex.ModelPrs_SceneNode & CustomSceneNode) | undefined;
    const aRepresentation = thePart.representation(this.repMask);
    if (aRepresentation) {
      aRepresentationNode = this.sceneNodeFactory.createNodeFromRepresentation(aRepresentation) as cadex.ModelPrs_SceneNode & CustomSceneNode;
      // Representation node is the main node used for selection
      aRepresentationNode.representation = aRepresentation;
      aPartNode.addChildNode(aRepresentationNode);
    }
  }

  override visitInstanceEnter(theInstance: cadex.ModelData_Instance) {
    this.addSceneNode(theInstance, true);
    this.lastInstance = theInstance;
    return true;
  }

  override visitInstanceLeave(_theInstance: cadex.ModelData_Instance) {
    this.sceneNodes.pop();
    this.lastInstance = null;
  }

  override visitAssemblyEnter(theAssembly: cadex.ModelData_Assembly) {
    this.addSceneNode(theAssembly, true);
    return true;
  }

  override visitAssemblyLeave(_theAssembly: cadex.ModelData_Assembly) {
    this.sceneNodes.pop();
  }
}

class SelectedEntityVisitor extends cadex.ModelPrs_SelectedEntityVisitor {
  str: string;
  constructor() {
    super();
    this.str = '';
  }

  override visitShapeEntity(theShapeEntity: cadex.ModelPrs_SelectedShapeEntity) {
    this.str = Object.keys(cadex.ModelData_ShapeType).find((type) => theShapeEntity.shape.type === cadex.ModelData_ShapeType[type]) || 'Unknown type';
    if (theShapeEntity.shape instanceof cadex.ModelData_Vertex) {
      this.str += theShapeEntity.shape.point.toString();
    }
  }

  override visitPolyShapeEntity(_thePolyShapeEntity: cadex.ModelPrs_SelectedPolyShapeEntity) {
    this.str = 'Poly Shape';
  }

  override visitPolyFaceEntity(thePolyFaceEntity: cadex.ModelPrs_SelectedPolyFaceEntity): void {
    this.str = `Poly Face [${thePolyFaceEntity.faceIndex}]`;
  }

  override visitPolyLineEntity(thePolyLineEntity: cadex.ModelPrs_SelectedPolyLineEntity): void {
    this.str = `Poly Line [${thePolyLineEntity.lineIndex}]`;
  }

  override visitPolyVertexEntity(thePolyVertexEntity: cadex.ModelPrs_SelectedPolyVertexEntity) {
    this.str = `Poly Vertex [${thePolyVertexEntity.vertexIndex}]`;
  }
}

class PickResultFormatter extends cadex.ModelPrs_PickedEntityVisitor {
  pickedEntityStr: string | null;
  constructor() {
    super();
    this.pickedEntityStr = null;
  }

  partName(theRepNode: cadex.ModelPrs_SceneNode) {
    const aPartName = (theRepNode.parent as cadex.ModelPrs_SceneNode & CustomSceneNode).name;
    return aPartName ? `"${aPartName}" part` : 'Unnamed part';
  }

  override visitPickedNodeEntity(theEntity: cadex.ModelPrs_PickedNodeEntity) {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    this.pickedEntityStr = aRep ? this.partName(theEntity.node) : 'Unknown node';
  }

  override visitPickedShapeEntity(theEntity: cadex.ModelPrs_PickedShapeEntity) {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    if (aRep) {
      const aPartName = this.partName(theEntity.node);
      const aBRepRep = aRep as cadex.ModelData_BRepRepresentation;
      const aShapeId = aBRepRep.shapeId(theEntity.shape);
      const aShapeTypeName = Object.keys(cadex.ModelData_ShapeType).find((n) => cadex.ModelData_ShapeType[n] === theEntity.shape.type);
      this.pickedEntityStr = `${aShapeTypeName} ${aShapeId} of ${aPartName}`;
    } else {
      this.pickedEntityStr = "Unknown node's shape";
    }
  }

  override visitPickedPolyShapeEntity(theEntity: cadex.ModelPrs_PickedPolyShapeEntity) {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    if (aRep) {
      const aPartName = this.partName(theEntity.node);
      this.pickedEntityStr = `Poly shape of ${aPartName}<br>Intersection point: ${theEntity.point}<br>Normal: ${theEntity.normal}`;
    } else {
      this.pickedEntityStr = "Unknown node' poly shape";
    }
  }

  override visitPickedPolyFaceEntity(theEntity: cadex.ModelPrs_PickedPolyFaceEntity): void {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    if (aRep) {
      const aPartName = this.partName(theEntity.node);
      this.pickedEntityStr = `Triangle ${theEntity.faceIndex} of triangle set of ${aPartName}<br>Intersection point: ${theEntity.point}<br>Normal: ${theEntity.normal}`;
    } else {
      this.pickedEntityStr = "Unknown node's poly face";
    }
  }

  override visitPickedPolyLineEntity(theEntity: cadex.ModelPrs_PickedPolyLineEntity): void {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    if (aRep) {
      const aPartName = this.partName(theEntity.node);
      this.pickedEntityStr = `Line ${theEntity.lineIndex} of line set of ${aPartName}<br>Intersection point: ${theEntity.point}`;
    } else {
      this.pickedEntityStr = "Unknown node's poly line";
    }
  }

  override visitPickedPolyVertexEntity(theEntity: cadex.ModelPrs_PickedPolyVertexEntity) {
    const aRep = (theEntity.node as cadex.ModelPrs_SceneNode & CustomSceneNode).representation;
    if (aRep) {
      const aPartName = this.partName(theEntity.node);
      this.pickedEntityStr = `Vertex ${theEntity.vertexIndex} of poly shape of ${aPartName}<br>Intersection point: ${theEntity.point}`;
    } else {
      this.pickedEntityStr = "Unknown node's poly shape vertex";
    }
  }

  override visitPickedClipPlaneEntity(_theEntity: cadex.ModelPrs_PickedClipPlaneEntity) {
    this.pickedEntityStr = 'Clip plane';
  }
}

export class ContextMenuHandler extends cadex.ModelPrs_ContextMenuHandler {
  scene: cadex.ModelPrs_Scene;
  contextMenuElement: HTMLElement;

  constructor(theScene: cadex.ModelPrs_Scene) {
    super();
    this.scene = theScene;
    this.contextMenuElement = document.getElementById('context-menu') as HTMLElement;

    // Hide mouse menu by any mouse press
    document.addEventListener('pointerdown', (theEvent) => {
      if ((theEvent?.target as HTMLElement | null)?.closest('.context-menu')) {
        this.hideContextMenu();
      }
    });
  }

  override contextMenu(theEvent: cadex.ModelPrs_PointerInputEvent) {
    const aPosition = theEvent.point.position;
    const aPickResult = this.scene.selectionManager.pickFromViewport(aPosition.x, aPosition.y, theEvent.viewport);
    if (aPickResult) {
      const aPickedEntityVisitor = new PickResultFormatter();
      aPickResult.pickedEntity.accept(aPickedEntityVisitor);
      this.contextMenuElement.innerHTML = aPickedEntityVisitor.pickedEntityStr || 'Unable to parse pick result';
    } else {
      this.contextMenuElement.innerHTML = 'No object detected';
    }
    this.contextMenuElement.style.display = 'block';
    this.contextMenuElement.style.left = `${aPosition.x}px`;
    this.contextMenuElement.style.top = `${aPosition.y}px`;
  }

  hideContextMenu() {
    this.contextMenuElement.style.display = '';
  }
}

// Expcustom - Created from existing SelectionHandlingView Class
export class SelectionHandling {
  async loadAndDisplayModel(_hasBRepRep) {
    const aSelectionModeSelector = document.querySelector('#selection-mode-selector>select') as HTMLSelectElement;

    // const aBRepSelectionModeGroup = aSelectionModeSelector.querySelector('optgroup[label*="B-Rep"]') as HTMLOptGroupElement;
    // aBRepSelectionModeGroup.disabled = !hasBRepRep;

    // const aPolySelectionModeGroup = aSelectionModeSelector.querySelector('optgroup[label*="Poly"]') as HTMLOptGroupElement;
    // aPolySelectionModeGroup.disabled = hasBRepRep;

    // aSelectionModeSelector.value = hasBRepRep ? 'Vertex' : 'PolyShape';
    aSelectionModeSelector.value = 'Solid';
    aSelectionModeSelector.dispatchEvent(new Event('change'));

    // Create visualization graph for model.
    // const aModelConverter = new SceneGraphConverter(cadex.ModelData_RepresentationMask.ModelData_RM_Any, this.viewerTools);
    // await this.model.accept(aModelConverter);
  }

  onSelectionChanged(theEvent: cadex.ModelPrs_SelectionChangedEvent) {
    const formatItem = (theItem: cadex.ModelPrs_SelectionItem): string => {
      let aMessage = '';
      const aRepNode = theItem.node as cadex.ModelPrs_SceneNode & CustomSceneNode;
      if (!aRepNode.representation) {
        return 'Unknown item';
      }
      const aPartName = (aRepNode.parent as cadex.ModelPrs_SceneNode & CustomSceneNode).name;
      aMessage += `{\n  part: ${aPartName ? `"${aPartName}" ` : 'Unnamed'}\n`;
      if (theItem.numberOfEntities > 0) {
        aMessage += '  entities: [';
        const aSelectedEntityVisitor = new SelectedEntityVisitor();
        for (const anEntity of theItem.entities()) {
          anEntity.accept(aSelectedEntityVisitor);
          aMessage += `\n    ${aSelectedEntityVisitor.str},`;
        }
        aMessage += '\n  ]\n';
      }
      aMessage += '}';

      return aMessage;
    };

    if (theEvent.removed.length > 0) {
      let aMessage = `Deselected ${theEvent.removed.length} item${theEvent.removed.length > 1 ? 's' : ''}:\n`;
      aMessage += theEvent.removed.map(formatItem).join('\n');
      console.log(aMessage);
    }
    if (theEvent.added.length > 0) {
      let aMessage = `Selected ${theEvent.added.length} item${theEvent.added.length > 1 ? 's' : ''}:\n`;
      aMessage += theEvent.added.map(formatItem).join('\n');
      console.log(aMessage);
    }
  }
}
