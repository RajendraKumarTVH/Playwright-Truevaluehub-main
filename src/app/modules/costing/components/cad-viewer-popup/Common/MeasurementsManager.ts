import cadex from '@cadexchanger/web-toolkit';

export enum MeasurementMode {
  Distance = 0,
  Angle = 1,
}

type SceneNodeWithMeasurementRef = cadex.ModelPrs_SceneNode & {
  measurement: MeasurementWithSceneNodeRef;
};

type MeasurementWithSceneNodeRef = cadex.ModelPrs_Measurement & {
  sceneNode: SceneNodeWithMeasurementRef;
};

interface MeasurementSelectionItem {
  node: cadex.ModelPrs_SceneNode;
  entity: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity;
}

export class MeasurementsManager extends cadex.ModelPrs_InputHandler {
  private myScene: cadex.ModelPrs_Scene;

  private myEarlierMeasurements: Set<MeasurementWithSceneNodeRef> = new Set();
  private myMeasurements: Set<MeasurementWithSceneNodeRef> = new Set();
  private mySelectedMeasurements: Set<MeasurementWithSceneNodeRef> = new Set();
  private mySelectedEntities: Array<MeasurementSelectionItem> = [];

  private myMeasurementsFactory = new cadex.ModelPrs_MeasurementFactory();
  private myMeasurementsSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
  private myMeasurementsRootNode = new cadex.ModelPrs_SceneNode();

  private myMeasurementMode = MeasurementMode.Distance;
  private myFontSize = 10;
  private myLengthUnit = cadex.Base_LengthUnit.Base_LU_Millimeters;
  private myAngleUnit = cadex.Base_AngleUnit.Base_AU_Radians;

  override isAcceptKeyEvents = true;

  constructor(theScene: cadex.ModelPrs_Scene) {
    super();
    this.myScene = theScene;

    // Manager is inactive by default
    this.enabled = false;

    this.myMeasurementsRootNode.displayMode = cadex.ModelPrs_DisplayMode.Shaded;
    this.myMeasurementsRootNode.selectionMode = cadex.ModelPrs_SelectionMode.Node;
    this.myMeasurementsRootNode.appearance = new cadex.ModelData_Appearance(cadex.ModelData_ColorObject.fromHex(0x000));
    this.myScene.addRoot(this.myMeasurementsRootNode);
    this.myScene.update();
  }

  get isActive() {
    return this.enabled;
  }

  set isActivate(theActive: boolean) {
    if (this.enabled !== theActive) {
      this.enabled = theActive;
      if (this.enabled) {
        this.myScene.selectionManager.deselectAll();
        this.mySelectedMeasurements.clear();
        this.mySelectedEntities.length = 0;
        this.myScene.selectionManager.addEventListener('selectionChanged', this.onSceneSelectionChanged);
      } else {
        this.myScene.selectionManager.removeEventListener('selectionChanged', this.onSceneSelectionChanged);
      }
      this.dispatchEvent({
        type: 'isActiveChanged',
      });
    }
  }

  get measurementMode() {
    return this.myMeasurementMode;
  }

  set measurementMode(theMeasurementMode) {
    if (this.myMeasurementMode === theMeasurementMode) {
      return;
    }
    this.myMeasurementMode = theMeasurementMode;
    this.dispatchEvent({
      type: 'measurementModeChanged',
    });
  }

  get lengthUnit() {
    return this.myLengthUnit;
  }

  set lengthUnit(theLengthUnit: cadex.Base_LengthUnit) {
    if (this.myLengthUnit === theLengthUnit) {
      return;
    }
    this.myLengthUnit = theLengthUnit;
    this.mySelectedMeasurements.forEach((theMeasurement) => {
      if (theMeasurement instanceof cadex.ModelPrs_LinearMeasurement) {
        theMeasurement.lengthUnit = theLengthUnit;
        theMeasurement.sceneNode.invalidate();
      }
    });
    this.dispatchEvent({
      type: 'lengthUnitChanged',
    });
    this.myScene.update();
  }

  get angleUnit() {
    return this.myAngleUnit;
  }

  set angleUnit(theAngleUnit: cadex.Base_AngleUnit) {
    if (this.myAngleUnit === theAngleUnit) {
      return;
    }
    this.myAngleUnit = theAngleUnit;
    this.mySelectedMeasurements.forEach((theMeasurement) => {
      if (theMeasurement instanceof cadex.ModelPrs_AngularMeasurement) {
        theMeasurement.angleUnit = theAngleUnit;
        theMeasurement.sceneNode.invalidate();
      }
    });
    this.dispatchEvent({
      type: 'angleUnitChanged',
    });
    this.myScene.update();
  }

  get fontSize() {
    return this.myFontSize;
  }

  set fontSize(theFontSize) {
    if (this.myFontSize === theFontSize) {
      return;
    }
    this.myFontSize = theFontSize;
    this.dispatchEvent({
      type: 'fontSizeChanged',
    });
  }

  get numberOfMeasurements() {
    return this.myMeasurements.size;
  }

  measurements(): IterableIterator<cadex.ModelPrs_Measurement> {
    return this.measurements[Symbol.iterator]();
  }

  selectedMeasurements(): IterableIterator<cadex.ModelPrs_Measurement> {
    return this.selectedMeasurements[Symbol.iterator]();
  }

  async addMeasurement(theMeasurement: cadex.ModelPrs_Measurement) {
    const aMeasurement = theMeasurement as MeasurementWithSceneNodeRef;
    if (this.myMeasurements.has(aMeasurement)) {
      return;
    }

    if (aMeasurement instanceof cadex.ModelPrs_LinearMeasurement) {
      this.setupLinearMeasurement(aMeasurement);
    } else if (aMeasurement instanceof cadex.ModelPrs_AngularMeasurement) {
      this.setupAngularMeasurement(aMeasurement);
    }

    const aMeasurementSceneNode = this.myMeasurementsSceneNodeFactory.createNodeFromMeasurement(theMeasurement) as SceneNodeWithMeasurementRef;
    aMeasurementSceneNode.measurement = aMeasurement;
    aMeasurement.sceneNode = aMeasurementSceneNode;

    this.myMeasurements.add(aMeasurement);
    this.myMeasurementsRootNode.addChildNode(aMeasurementSceneNode);

    // this.myScene.selectionManager.deselectAll();
    /**ExpCustom - Begin */
    this.myScene.selectionManager.deselectAll();
    this.mySelectedMeasurements.clear();
    this.mySelectedEntities.length = 0;
    /**ExpCustom - End */

    await this.myScene.update();

    this.dispatchEvent({
      type: 'measurementsChanged',
    });
  }

  async removeMeasurement(theMeasurement: cadex.ModelPrs_Measurement) {
    const aMeasurement = theMeasurement as MeasurementWithSceneNodeRef;
    if (!this.myMeasurements.has(aMeasurement)) {
      return;
    }
    this.myMeasurements.delete(aMeasurement);
    this.mySelectedMeasurements.delete(aMeasurement);
    this.myMeasurementsRootNode.removeChildNode(aMeasurement.sceneNode);

    await this.myScene.update();

    this.dispatchEvent({
      type: 'measurementsChanged',
    });
  }

  async removeAllMeasurements() {
    if (this.myMeasurements.size === 0) {
      return;
    }
    this.myMeasurements.forEach((theMeasurement) => {
      this.myMeasurementsRootNode.removeChildNode(theMeasurement.sceneNode);
    });
    this.myMeasurements.clear();
    this.mySelectedMeasurements.clear();
    await this.myScene.update();
    this.dispatchEvent({
      type: 'measurementsChanged',
    });
  }

  async showAllMeasurements() {
    this.myEarlierMeasurements.forEach((theMeasurement) => {
      this.addMeasurement(theMeasurement);
    });
  }

  async hideAllMeasurements() {
    this.myEarlierMeasurements = new Set(this.myMeasurements);
    await this.removeAllMeasurements();
  }

  private onSceneSelectionChanged = (theEvent: cadex.ModelPrs_SelectionChangedEvent) => {
    theEvent.added.forEach((theSelectedItem) => {
      if (theSelectedItem.isWholeSelectedNode && this.myMeasurements.has((theSelectedItem.node as SceneNodeWithMeasurementRef).measurement)) {
        this.mySelectedMeasurements.add((theSelectedItem.node as SceneNodeWithMeasurementRef).measurement);
      } else {
        const aSelectedEntityCollector = new SelectedEntitiesCollector(theSelectedItem.node);
        for (const aSelectedEntity of theSelectedItem.entities()) {
          aSelectedEntity.accept(aSelectedEntityCollector);
        }
        this.mySelectedEntities.push(...aSelectedEntityCollector.entities);
      }
    });
    theEvent.removed.forEach((theSelectedItem) => {
      if (theSelectedItem.isWholeSelectedNode && this.myMeasurements.has((theSelectedItem.node as SceneNodeWithMeasurementRef).measurement)) {
        this.mySelectedMeasurements.delete((theSelectedItem.node as SceneNodeWithMeasurementRef).measurement);
      } else {
        const aSelectedEntityCollector = new SelectedEntitiesCollector(theSelectedItem.node);
        for (const aSelectedEntity of theSelectedItem.entities()) {
          aSelectedEntity.accept(aSelectedEntityCollector);
        }
        aSelectedEntityCollector.entities.forEach((theEntity) => {
          const anIndex = this.mySelectedEntities.findIndex((theSelectedEntity) => {
            return theSelectedEntity.node === theEntity.node && theSelectedEntity.entity.isEqual(theEntity.entity);
          });
          if (anIndex !== -1) {
            this.mySelectedEntities.splice(anIndex, 1);
          }
        });
      }
    });

    if (this.myMeasurementMode === MeasurementMode.Distance && this.mySelectedEntities.length === 2) {
      const aDistanceMeasurement = this.createDistanceMeasurement(
        this.mySelectedEntities[0].entity,
        this.mySelectedEntities[1].entity,
        this.mySelectedEntities[0].node.combinedTransformation,
        this.mySelectedEntities[1].node.combinedTransformation
      );
      if (aDistanceMeasurement) {
        this.addMeasurement(aDistanceMeasurement);
        this.myScene.selectionManager.deselectAll();
      }
    }
    if (this.myMeasurementMode === MeasurementMode.Angle && this.mySelectedEntities.length === 3) {
      const anAngleMeasurement = this.createAngleMeasurement(
        this.mySelectedEntities[0].entity,
        this.mySelectedEntities[1].entity,
        this.mySelectedEntities[2].entity,
        this.mySelectedEntities[0].node.combinedTransformation,
        this.mySelectedEntities[1].node.combinedTransformation,
        this.mySelectedEntities[2].node.combinedTransformation
      );
      if (anAngleMeasurement) {
        this.addMeasurement(anAngleMeasurement);
        this.myScene.selectionManager.deselectAll();
      }
    }
  };

  /**
   * Helper method create distance measurement from selected entities.
   */
  protected createDistanceMeasurement(
    theE1: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity,
    theE2: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity,
    theTrsf1?: cadex.ModelData_Transformation | null,
    theTrsf2?: cadex.ModelData_Transformation | null
  ): cadex.ModelPrs_LinearMeasurement | null {
    let aDistanceMeasurement: cadex.ModelPrs_LinearMeasurement | null = null;
    if (theE1 instanceof cadex.ModelPrs_SelectedPolyVertexEntity && theE2 instanceof cadex.ModelPrs_SelectedPolyVertexEntity) {
      const aFirstPoint = theE1.vertexSet.coordinate(theE1.vertexIndex)!;
      if (theTrsf1) {
        aFirstPoint.transform(theTrsf1);
      }
      const aSecondPoint = theE2.vertexSet.coordinate(theE2.vertexIndex)!;
      if (theTrsf2) {
        aSecondPoint.transform(theTrsf2);
      }
      aDistanceMeasurement = this.myMeasurementsFactory.createDistanceFromPoints(aFirstPoint, aSecondPoint);
    }

    if (theE1 instanceof cadex.ModelPrs_SelectedShapeEntity && theE2 instanceof cadex.ModelPrs_SelectedShapeEntity) {
      aDistanceMeasurement = this.myMeasurementsFactory.createDistanceFromShapes(theE1.shape, theE2.shape, theTrsf1, theTrsf2);
    }

    if (aDistanceMeasurement) {
      console.log(`New distance measurement created:
Vertexes: ${aDistanceMeasurement.points}
Result: ${aDistanceMeasurement.value}
Rendered text: ${aDistanceMeasurement.toString()}`);
    }

    return aDistanceMeasurement;
  }

  /**
   * Helper method create angle measurement from selected entities.
   */
  protected createAngleMeasurement(
    theE1: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity,
    theE2: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity,
    theE3: cadex.ModelPrs_SelectedPolyVertexEntity | cadex.ModelPrs_SelectedShapeEntity,
    theTrsf1?: cadex.ModelData_Transformation | null,
    theTrsf2?: cadex.ModelData_Transformation | null,
    theTrsf3?: cadex.ModelData_Transformation | null
  ): cadex.ModelPrs_AngularMeasurement | null {
    let aFirstPoint: cadex.ModelData_Point;
    if (theE1 instanceof cadex.ModelPrs_SelectedPolyVertexEntity) {
      aFirstPoint = theE1.vertexSet.coordinate(theE1.vertexIndex)!;
    } else if (theE1.shape instanceof cadex.ModelData_Vertex) {
      aFirstPoint = theE1.shape.point.clone();
    } else {
      return null;
    }
    if (theTrsf1) {
      aFirstPoint.transform(theTrsf1);
    }

    let aSecondPoint: cadex.ModelData_Point;
    if (theE2 instanceof cadex.ModelPrs_SelectedPolyVertexEntity) {
      aSecondPoint = theE2.vertexSet.coordinate(theE2.vertexIndex)!;
    } else if (theE2.shape instanceof cadex.ModelData_Vertex) {
      aSecondPoint = theE2.shape.point.clone();
    } else {
      return null;
    }
    if (theTrsf2) {
      aSecondPoint.transform(theTrsf2);
    }

    let aThirdPoint: cadex.ModelData_Point;
    if (theE3 instanceof cadex.ModelPrs_SelectedPolyVertexEntity) {
      aThirdPoint = theE3.vertexSet.coordinate(theE3.vertexIndex)!;
    } else if (theE3.shape instanceof cadex.ModelData_Vertex) {
      aThirdPoint = theE3.shape.point.clone();
    } else {
      return null;
    }
    if (theTrsf3) {
      aThirdPoint.transform(theTrsf3);
    }
    const anAngleMeasurement = this.myMeasurementsFactory.createAngleFromPoints(aFirstPoint, aSecondPoint, aThirdPoint);
    if (anAngleMeasurement) {
      console.log(`New angle measurement created:
Point 1: ${aFirstPoint}
Point 2: ${aSecondPoint}
Point 3: ${aThirdPoint}
Result: ${anAngleMeasurement.value}
Rendered text: ${anAngleMeasurement.toString()}`);
    }
    return anAngleMeasurement;
  }

  protected setupLinearMeasurement(theLinearMeasurement: cadex.ModelPrs_LinearMeasurement) {
    const [aPoint1, aPoint2] = theLinearMeasurement.points;

    // find the extension line direction
    // the main idea is to use direction aligned with vector from scene bbox center to measurement points.
    const aBBoxCenter = this.myScene.boundingBox.getCenter();

    // use center of measurement reference point for extension line direction
    const anExtensionLineDirection = new cadex.ModelData_Vector().addVectors(aPoint1, aPoint2).multiplyScalar(0.5).subtract(aBBoxCenter).normalize();

    // next try to align annotation direction with X, Y, Z axes.
    const aP1P2Direction = new cadex.ModelData_Vector().subtractVectors(aPoint1, aPoint2).normalize();
    const aDirXAbs = Math.abs(anExtensionLineDirection.x);
    const aDirYAbs = Math.abs(anExtensionLineDirection.y);
    const aDirZAbs = Math.abs(anExtensionLineDirection.z);
    if (aDirZAbs && aDirZAbs >= aDirXAbs && aDirZAbs >= aDirYAbs) {
      if (Math.abs(aP1P2Direction.x) < 1e-5 && Math.abs(aP1P2Direction.y) < 1e-5) {
        // degenerate case, choose X axis
        anExtensionLineDirection.z = 0;
      } else {
        anExtensionLineDirection.x = 0;
      }
      anExtensionLineDirection.y = 0;
    } else if (aDirXAbs > 1e-5 && aDirXAbs >= aDirYAbs && aDirXAbs >= aDirZAbs) {
      if (Math.abs(aP1P2Direction.y) < 1e-5 && Math.abs(aP1P2Direction.z) < 1e-5) {
        // degenerate case, choose Z axis
        anExtensionLineDirection.x = 0;
      } else {
        anExtensionLineDirection.z = 0;
      }
      anExtensionLineDirection.y = 0;
    } else if (aDirYAbs > 1e-5) {
      if (Math.abs(aP1P2Direction.x) < 1e-5 && Math.abs(aP1P2Direction.z) < 1e-5) {
        // degenerate case, choose Z axis
        anExtensionLineDirection.y = 0;
      } else {
        anExtensionLineDirection.z = 0;
      }
      anExtensionLineDirection.x = 0;
    } else {
      // default is Z axis
      anExtensionLineDirection.setCoord(0, 0, 1);
    }

    // orthogonalize extension line direction
    const anOrthogonalizedExtensionLineDirection = cadex.ModelData_Direction.fromXYZ(aP1P2Direction).cross(anExtensionLineDirection).cross(aP1P2Direction);

    // For better UX place measurement label out of model bbox

    // find the max distance between points to BBox boundaries in chosen direction
    const tmp = new cadex.ModelData_Vector();
    const aBBoxMinCorner = this.myScene.boundingBox.minCorner;
    const aBBoxMaxCorner = this.myScene.boundingBox.maxCorner;
    let anExtensionLineLength = Math.max(
      tmp.subtractVectors(aBBoxMinCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint1).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMinCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection),
      tmp.subtractVectors(aBBoxMaxCorner, aPoint2).dot(anOrthogonalizedExtensionLineDirection)
    );

    if (anExtensionLineLength < 0) {
      anExtensionLineLength *= -1;
    }

    // add addition offset for better UX
    anExtensionLineLength += 3 * this.myFontSize;

    theLinearMeasurement.fontSize = this.myFontSize;
    theLinearMeasurement.lengthUnit = this.myLengthUnit;
    theLinearMeasurement.extensionLineDirection = anOrthogonalizedExtensionLineDirection;
    theLinearMeasurement.extensionLineLength = anExtensionLineLength;
    theLinearMeasurement.extensionOverhangLength = 0.4 * this.myFontSize;
  }

  protected setupAngularMeasurement(theAngularMeasurement: cadex.ModelPrs_AngularMeasurement) {
    theAngularMeasurement.fontSize = this.myFontSize;
    theAngularMeasurement.angleUnit = this.myAngleUnit;
    theAngularMeasurement.extensionLineLength = 100 * this.myFontSize;
    theAngularMeasurement.extensionOverhangLength = 0.4 * this.myFontSize;
  }

  override keyDown(theEvent: cadex.ModelPrs_KeyboardInputEvent): boolean {
    if (theEvent.code === 'Delete') {
      if (this.mySelectedMeasurements.size > 0) {
        this.mySelectedMeasurements.forEach((theMeasurement) => {
          this.myMeasurements.delete(theMeasurement);
          this.myMeasurementsRootNode.removeChildNode(theMeasurement.sceneNode);
        });
        this.mySelectedMeasurements.clear();
        this.dispatchEvent({
          type: 'measurementsChanged',
        });
        this.myScene.update();
      }
      return true;
    }
    return false;
  }
}

class SelectedEntitiesCollector extends cadex.ModelPrs_SelectedEntityVisitor {
  entities: MeasurementSelectionItem[] = [];

  constructor(private node: cadex.ModelPrs_SceneNode) {
    super();
  }

  override visitPolyShapeEntity(_thePolyShapeEntity: cadex.ModelPrs_SelectedPolyShapeEntity) {} // NOSONAR

  override visitPolyFaceEntity(_thePolyFaceEntity: cadex.ModelPrs_SelectedPolyFaceEntity): void {} // NOSONAR

  override visitPolyLineEntity(_thePolyLineEntity: cadex.ModelPrs_SelectedPolyLineEntity): void {} // NOSONAR

  override visitPolyVertexEntity(thePolyVertexEntity: cadex.ModelPrs_SelectedPolyVertexEntity) {
    this.entities.push({
      entity: thePolyVertexEntity,
      node: this.node,
    });
  }

  override visitShapeEntity(theShapeEntity: cadex.ModelPrs_SelectedShapeEntity) {
    this.entities.push({
      entity: theShapeEntity,
      node: this.node,
    });
  }

  override visitPointEntity(_thePointEntity: cadex.ModelPrs_SelectedPointEntity) {} // NOSONAR
}
