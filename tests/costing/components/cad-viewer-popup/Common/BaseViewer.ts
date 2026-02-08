import { ProgressStatusManager } from './ProgressStatusManager';
import { ModelAnalyzer } from './helpers';
import cadex from '@cadexchanger/web-toolkit';

export interface ModelInfo {
  modelName: string;
  filename: string;
}

export class BaseViewer extends cadex.ModelPrs_EventDispatcher {
  // The models
  bimModel = new cadex.ModelData_BIMModel();
  model = new cadex.ModelData_Model();
  // The scene for visualization
  scene = new cadex.ModelPrs_Scene();
  // The scene node for model visualization
  protected modelSceneNode = new cadex.ModelPrs_SceneNode();
  // The viewport for visualization.
  viewport: cadex.ModelPrs_ViewPort;

  progressStatusManager = new ProgressStatusManager();

  hasBRepRep = false;
  polyRepCount = 0;

  fitAllMargins: cadex.ModelPrs_ViewportPaddings | number = 5;
  disposed = false;
  _collectedParts: any; //ExpCustom

  // ExpCustom - Begin
  _rootSceneNode: any;
  _sceneNodeFactory: any;
  // ExpCustom - End

  constructor(
    public domElement: HTMLElement,
    theViewPortConfig?: cadex.ModelPrs_ViewPortConfig
  ) {
    super();

    // Initializing viewer with default config and element attach to.
    this.viewport = new cadex.ModelPrs_ViewPort(theViewPortConfig, this.domElement);
    // Attach viewport to scene to render content of
    this.viewport.attachToScene(this.scene);

    this.domElement.appendChild(this.progressStatusManager.domElement);

    this.modelSceneNode.selectionMode = cadex.ModelPrs_SelectionMode.Body | cadex.ModelPrs_SelectionMode.PolyShape;
    this.scene.addRoot(this.modelSceneNode);

    // ExpCustom - Begin
    this._sceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
    this._rootSceneNode = new cadex.ModelPrs_SceneNode();
    // ExpCustom - End
  }

  async clear(theProgressScope?: cadex.Base_ProgressScope) {
    if (this.disposed || theProgressScope?.owner.wasCanceled()) {
      return;
    }
    this.model.clear();
    this.modelSceneNode.removeChildNodes();
    await this.scene.update(theProgressScope);
  }

  get modelDisplayMode() {
    return this.modelSceneNode.displayMode;
  }

  set modelDisplayMode(mode: cadex.ModelPrs_DisplayMode) {
    this.modelSceneNode.displayMode = mode;
  }

  get modelSelectionMode() {
    return this.modelSceneNode.selectionMode;
  }

  set modelSelectionMode(mode: cadex.ModelPrs_SelectionMode) {
    this.modelSceneNode.selectionMode = mode;
    this.scene.update();
  }

  protected async loadModel(theFileName: string, dataLoader: cadex.ModelData_ExternalDataProvider, theProgressScope: cadex.Base_ProgressScope) {
    if (this.disposed || theProgressScope.owner.wasCanceled()) {
      return;
    }
    const aModelLoadingProgressScope = new cadex.Base_ProgressScope(theProgressScope);
    try {
      // Load model using universal reader.
      const aModelReader = new cadex.ModelData_ModelReader(aModelLoadingProgressScope);
      if (!(await aModelReader.loadModel(theFileName, this.model, dataLoader))) {
        throw new Error(`Failed to load and convert the file ${theFileName}`);
      }

      const aModelAnalyser = new ModelAnalyzer();
      await this.model.accept(new cadex.ModelData_SceneGraphElementUniqueVisitor(aModelAnalyser));
      this.hasBRepRep = aModelAnalyser.hasBRepRep;
      this.polyRepCount = aModelAnalyser.polyRepCount;
      this._collectedParts = aModelAnalyser.collectedParts; //ExpCustom

      console.log(`Model '${theFileName}' is loaded\n`);
    } finally {
      aModelLoadingProgressScope.close();
    }
  }

  protected async loadBIMModel(theFileName: string, dataLoader: cadex.ModelData_ExternalDataProvider, theProgressScope: cadex.Base_ProgressScope) {
    if (this.disposed || theProgressScope.owner.wasCanceled()) {
      return;
    }
    const aModelLoadingProgressScope = new cadex.Base_ProgressScope(theProgressScope);
    try {
      // Load model using universal reader.
      const aModelReader = new cadex.ModelData_ModelReader(aModelLoadingProgressScope);
      if (!(await aModelReader.loadBIMModel(theFileName, this.bimModel, dataLoader))) {
        throw new Error(`Failed to load and convert the file ${theFileName}`);
      }
      this.hasBRepRep = true;
      this.polyRepCount = 0;
      console.log(`Model '${theFileName}' is loaded\n`);
    } finally {
      aModelLoadingProgressScope.close();
    }
  }

  protected async displayModel(theRepMask: string | cadex.ModelData_RepresentationMask, theProgressScope: cadex.Base_ProgressScope) {
    if (this.disposed || theProgressScope.owner.wasCanceled()) {
      return;
    }
    const aModelDisplayingProgressScope = new cadex.Base_ProgressScope(theProgressScope);
    try {
      // Create visualization graph for model.
      const aSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();

      const aSceneNode = await aSceneNodeFactory.createGraphFromModel(this.model, theRepMask);
      if (!aSceneNode) {
        throw new Error('Failed to create scene graph from the model.');
      }

      this.modelSceneNode.addChildNode(aSceneNode);

      // Update scene to apply changes.
      await this.updateSceneSmoothly(aModelDisplayingProgressScope);

      // Finally move camera to position when the whole model is in sight
      this.fitAll();
    } finally {
      aModelDisplayingProgressScope.close();
    }
  }

  protected async displayBIMModel(theRepMask: string | cadex.ModelData_RepresentationMask, theProgressScope: cadex.Base_ProgressScope) {
    if (this.disposed || theProgressScope.owner.wasCanceled()) {
      return;
    }
    const aModelDisplayingProgressScope = new cadex.Base_ProgressScope(theProgressScope);
    try {
      // Create visualization graph for model.
      const aSceneNodeFactory = new cadex.ModelPrs_SceneNodeFactory();
      const aSceneNode = await aSceneNodeFactory.createGraphFromBIMModel(this.bimModel, theRepMask);
      if (!aSceneNode) {
        throw new Error('Failed to create scene graph from the model.');
      }

      this.modelSceneNode.addChildNode(aSceneNode);

      // Update scene to apply changes.
      await this.updateSceneSmoothly(aModelDisplayingProgressScope);

      // Finally move camera to position when the whole model is in sight
      this.fitAll();
    } finally {
      aModelDisplayingProgressScope.close();
    }
  }

  async loadAndDisplayModel(theModelInfo: ModelInfo, dataProvider: cadex.ModelData_ExternalDataProvider) {
    if (this.disposed) {
      return;
    }
    const aProgressScope = this.progressStatusManager.init().rootScope;
    try {
      await this.clear(new cadex.Base_ProgressScope(aProgressScope, 1));
      await this.loadModel(theModelInfo.filename, dataProvider, new cadex.Base_ProgressScope(aProgressScope, 5));
      await this.displayModel(cadex.ModelData_RepresentationMask.ModelData_RM_Any, new cadex.Base_ProgressScope(aProgressScope));
    } catch (theErr) {
      console.error(`Unable to load and display model "${theModelInfo.modelName}" [${(theErr as Error).message}]`);
    } finally {
      aProgressScope.close();
    }
  }

  async loadAndDisplayBIMModel(theModelInfo: ModelInfo, dataProvider: cadex.ModelData_ExternalDataProvider) {
    if (this.disposed) {
      return;
    }
    const aProgressScope = this.progressStatusManager.init().rootScope;
    try {
      await this.clear(new cadex.Base_ProgressScope(aProgressScope, 1));
      await this.loadBIMModel(theModelInfo.filename, dataProvider, new cadex.Base_ProgressScope(aProgressScope, 5));
      await this.displayBIMModel(cadex.ModelData_RepresentationMask.ModelData_RM_Any, new cadex.Base_ProgressScope(aProgressScope));
    } catch (theErr) {
      console.error(`Unable to load and display model "${theModelInfo.modelName}" [${(theErr as Error).message}]`);
    } finally {
      aProgressScope.close();
    }
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

  override dispose() {
    this.progressStatusManager.dispose();
    this.model.clear();
    this.bimModel.root = new cadex.ModelData_BIMSite();
    this.viewport.dispose();
    this.scene.dispose();
    this.disposed = true;
    super.dispose();
  }

  // ExpCustom - Begin
  /**
   * Remove the root part from the scene.
   */
  async removeRootPart() {
    try {
      this.scene.removeRoot(this._rootSceneNode);
      await this.scene.update();

      /* Finally move camera to position when the whole model is in sight: */
      this.viewport.fitAll();
    } catch (theErr) {
      console.error(`Unable to remove part [${/** @type {Error} */ theErr}]`);
    }
  }

  /**
   * Add and display the part on the scene.
   * @param {cadex.ModelData_Part} theSGE
   * @param {cadex.ModelPrs_SelectionMode} theSelectionMode cadex.ModelPrs_SelectionMode.Face by default
   * @param {cadex.ModelPrs_DisplayMode} theDisplayMode cadex.ModelPrs_DisplayMode.Shaded by default
   */
  async addRootPart(theSGE, theSelectionMode = cadex.ModelPrs_SelectionMode.Face, theDisplayMode = cadex.ModelPrs_DisplayMode.Shaded) {
    try {
      /* Create visualization graph for model: */
      this._rootSceneNode = this._sceneNodeFactory.createNodeFromSceneGraphElement(theSGE);

      if (!this._rootSceneNode) {
        throw new Error('Unable to create scene node from SGE.');
      }

      /* Set display mode for visualization: */
      this._rootSceneNode.displayMode = theDisplayMode;
      /* Set selection for visualization: */
      this._rootSceneNode.selectionMode = theSelectionMode;

      /* Add visualization graph for model to scene: */
      this.scene.addRoot(this._rootSceneNode);

      /* Update the scene to see visualization changes: */
      await this.scene.update();

      /* Finally move camera to position when the whole model is in sight: */
      this.viewport.fitAll();
    } catch (theErr) {
      console.error(`Unable to add and display part [${/** @type {Error} */ theErr}]`);
    }
  }

  /**
   * Add the body to the part and display on the scene.
   * @param {cadex.ModelData_Body} theBody
   * @param {{r: number, g: number, b: number}} [theRGBColor]
   * @return {Promise<cadex.ModelPrs_SceneNode | undefined>} Created body scene node.
   */
  async addBodyToRootPart(theBody, theRGBColor) {
    try {
      const aBodySceneNode = this._sceneNodeFactory.createNodeFromBody(theBody);
      if (theRGBColor) {
        aBodySceneNode.appearance = new cadex.ModelData_Appearance(new cadex.ModelData_ColorObject(theRGBColor.r, theRGBColor.g, theRGBColor.b));
      }

      this._rootSceneNode.addChildNode(aBodySceneNode);

      /* Update the scene to see visualization changes: */
      await this.scene.update();

      /* Finally move camera to position when the whole model is in sight: */
      this.viewport.fitAll();

      return aBodySceneNode;
    } catch (theErr) {
      console.error(`Unable to add and display body [${/** @type {Error} */ theErr}]`);
    }
  }

  /**
   * Form a body from shapes IDs.
   * @param {Array<cadex.ModelData_Shape>} theShapes
   * @return {Promise<cadex.ModelData_Body | undefined>}
   */
  async formBody(theShapes) {
    try {
      const anInitBodyShape = theShapes.pop();
      if (anInitBodyShape) {
        const aBody = cadex.ModelData_Body.create(anInitBodyShape);
        if (aBody) {
          theShapes.forEach((theShape) => aBody.append(theShape));
          return aBody;
        }
      }
      return null;
    } catch (theErr) {
      console.error(`Unable to form body [${/** @type {Error} */ theErr}]`);
      return null;
    }
  }
  // ExpCustom - End
}
