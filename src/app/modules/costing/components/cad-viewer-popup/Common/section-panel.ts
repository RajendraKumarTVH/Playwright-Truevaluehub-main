import cadex from '@cadexchanger/web-toolkit';
import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';

enum CliPlaneAxis {
  x = 'x',
  y = 'y',
  z = 'z',
}

class ClipPlane extends cadex.ModelPrs_ClipPlane {
  planeId: string;
  min: number;
  max: number;
  myValue: number;
  myBBox: cadex.ModelData_Box;
  myAxis: CliPlaneAxis;
  myReverse: boolean;
  planePanel: HTMLDivElement;
  static globalClipPlaneIndex: number;

  constructor(theBBox: cadex.ModelData_Box, theAxis: CliPlaneAxis) {
    // create default plane, the position and direction will be updated later
    const aPlane = cadex.ModelData_Plane.fromPointAndNormal(new cadex.ModelData_Point(), new cadex.ModelData_Direction(-1, 0, 0));
    super(aPlane);

    this.planeId = `${++ClipPlane.globalClipPlaneIndex}`;
    this.min = 0;
    this.max = 100;
    // in percents, from 0 to 100
    this.myValue = 50;
    this.myBBox = theBBox.clone();
    this.myAxis = theAxis;
    this.myReverse = false;

    this.updateRange();

    this.planePanel = this.createPlanePanel();
  }

  get value() {
    return this.myValue;
  }

  set value(theValue) {
    if (theValue < 0) {
      theValue = 0;
    }
    if (theValue > 100) {
      theValue = 100;
    }
    this.myValue = theValue;

    const aHtmlValue = `${this.myValue}`;
    const aRangeInput = this.planePanel.querySelector(`#position-range-${this.planeId}`) as HTMLInputElement;
    aRangeInput.value = aHtmlValue;

    const aPercentInput = this.planePanel.querySelector(`#position-percent-${this.planeId}`) as HTMLInputElement;
    aPercentInput.value = aHtmlValue;

    this.updatePlane();
  }

  get bbox() {
    return this.myBBox;
  }

  set bbox(theBBox) {
    this.myBBox.copy(theBBox);
    this.updateRange();
  }

  get axis() {
    return this.myAxis;
  }
  set axis(theAxis) {
    this.myAxis = theAxis;
    this.updateRange();
  }

  get reverse() {
    return this.myReverse;
  }
  set reverse(theReverse) {
    this.myReverse = theReverse;
    this.updatePlane();
  }

  updateRange() {
    this.min = this.myBBox.minCorner[this.myAxis];
    this.max = this.myBBox.maxCorner[this.myAxis];
    // Add additional 1% gap to avoid rendering artifacts
    const gap = (this.max - this.min) / 100;
    this.min -= gap;
    this.max += gap;
    this.updatePlane();
  }

  updatePlane() {
    const aPlane = this.plane;
    this.bbox.getCenter(aPlane.location);
    const aPositionValue = this.min + (this.max - this.min) * (this.value / 100);
    switch (this.axis) {
      case CliPlaneAxis.x:
        aPlane.location.x = aPositionValue;
        aPlane.direction.setCoord(this.reverse ? 1 : -1, 0, 0);
        break;
      case CliPlaneAxis.y:
        aPlane.location.y = aPositionValue;
        aPlane.direction.setCoord(0, this.reverse ? -1 : 1, 0);
        break;
      case CliPlaneAxis.z:
        aPlane.location.z = aPositionValue;
        aPlane.direction.setCoord(0, 0, this.reverse ? 1 : -1);
        break;
    }
    // just re-assign plane to apply plane changes and redraw viewport
    this.plane = aPlane;
  }

  onPositionChangedByScene() {
    this.value = ((this.plane.location[this.axis] - this.min) * 100) / (this.max - this.min);
  }

  createPlanePanel() {
    const aPlanePanel = document.createElement('div');
    aPlanePanel.classList.add('plane-panel');
    aPlanePanel.id = this.planeId;

    const anAxesSection = document.createElement('div');
    anAxesSection.classList.add('plane-panel__axes-section');
    aPlanePanel.appendChild(anAxesSection);

    const aPlaneTitle = document.createElement('span');
    aPlaneTitle.classList.add('plane-panel__plane-title');
    aPlaneTitle.innerText = 'Plane';
    anAxesSection.appendChild(aPlaneTitle);

    Object.keys(CliPlaneAxis).forEach((theAxis) => {
      const anAxisSection = document.createElement('div');
      anAxisSection.classList.add('plane-panel__axis-section');

      const anAxisRadio = document.createElement('input');
      anAxisRadio.id = `radio-${theAxis}-${this.planeId}`;
      anAxisRadio.type = 'radio';
      anAxisRadio.name = `radio-axes-${this.planeId}`;
      anAxisRadio.value = theAxis;
      anAxisRadio.checked = theAxis === this.axis;
      anAxisRadio.onclick = () => {
        this.axis = CliPlaneAxis[theAxis];
      };

      const anAxisLabel = document.createElement('label');
      anAxisLabel.htmlFor = anAxisRadio.id;
      anAxisLabel.innerText = theAxis.toUpperCase();

      anAxisSection.appendChild(anAxisRadio);
      anAxisSection.appendChild(anAxisLabel);

      anAxesSection.appendChild(anAxisSection);
    });

    const aDivider = document.createElement('div');
    aDivider.classList.add('plane-panel__divider');
    aPlanePanel.appendChild(aDivider);

    const aCappingCheckboxSection = document.createElement('div');
    aCappingCheckboxSection.classList.add('plane-panel__capping-checkbox-section');
    aPlanePanel.appendChild(aCappingCheckboxSection);

    const aCappingCheckbox = document.createElement('input');
    aCappingCheckbox.classList.add('plane-panel__checkbox-capping');
    aCappingCheckbox.id = `checkbox-capping-${this.planeId}`;
    aCappingCheckbox.type = 'checkbox';
    aCappingCheckbox.name = aCappingCheckbox.id;
    aCappingCheckbox.checked = true;
    aCappingCheckbox.onchange = (theEvent) => {
      theEvent.preventDefault();
      this.isCappingEnabled = aCappingCheckbox.checked;
    };

    const aCappingLabel = document.createElement('label');
    aCappingLabel.htmlFor = aCappingCheckbox.id;
    aCappingLabel.innerText = 'Capping';

    const aCappingColorChooser = document.createElement('input');
    aCappingColorChooser.classList.add('plane-panel__checkbox-capping-color-input');
    aCappingColorChooser.id = `checkbox-capping-color-input-${this.planeId}`;
    aCappingColorChooser.type = 'color';
    aCappingColorChooser.name = aCappingCheckbox.id;
    aCappingColorChooser.value = '#CDCDCD'; // default WTK color
    aCappingColorChooser.onchange = (theEvent) => {
      theEvent.preventDefault();
      const aStringColor = aCappingColorChooser.value;
      const r = parseInt(aStringColor.charAt(1) + aStringColor.charAt(2), 16) / 255;
      const g = parseInt(aStringColor.charAt(3) + aStringColor.charAt(4), 16) / 255;
      const b = parseInt(aStringColor.charAt(5) + aStringColor.charAt(6), 16) / 255;

      this.cappingAppearance = new cadex.ModelData_Appearance(new cadex.ModelData_ColorObject(r, g, b));
    };

    aCappingCheckboxSection.appendChild(aCappingCheckbox);
    aCappingCheckboxSection.appendChild(aCappingLabel);
    aCappingCheckboxSection.appendChild(aCappingColorChooser);

    const aHatchingCheckboxSection = document.createElement('div');
    aHatchingCheckboxSection.classList.add('plane-panel__hatching-checkbox-section');
    aPlanePanel.appendChild(aHatchingCheckboxSection);

    const aHatchingCheckbox = document.createElement('input');
    aHatchingCheckbox.classList.add('plane-panel__checkbox-hatching');
    aHatchingCheckbox.id = `checkbox-hatching-${this.planeId}`;
    aHatchingCheckbox.type = 'checkbox';
    aHatchingCheckbox.name = aHatchingCheckbox.id;
    aHatchingCheckbox.checked = true;
    aHatchingCheckbox.onchange = (theEvent) => {
      theEvent.preventDefault();
      this.isHatchingEnabled = aHatchingCheckbox.checked;
    };

    const aHatchingLabel = document.createElement('label');
    aHatchingLabel.htmlFor = aHatchingCheckbox.id;
    aHatchingLabel.innerText = 'Hatching';

    aHatchingCheckboxSection.appendChild(aHatchingCheckbox);
    aHatchingCheckboxSection.appendChild(aHatchingLabel);

    const aReverseCheckboxSection = document.createElement('div');
    aReverseCheckboxSection.classList.add('plane-panel__reverse-checkbox-section');
    aPlanePanel.appendChild(aReverseCheckboxSection);

    const aReverseCheckbox = document.createElement('input');
    aReverseCheckbox.classList.add('plane-panel__checkbox-reverse');
    aReverseCheckbox.id = `checkbox-reverse-${this.planeId}`;
    aReverseCheckbox.type = 'checkbox';
    aReverseCheckbox.name = aReverseCheckbox.id;
    aReverseCheckbox.checked = false;
    aReverseCheckbox.onchange = (theEvent) => {
      theEvent.preventDefault();
      this.reverse = aReverseCheckbox.checked;
    };

    const aReverseLabel = document.createElement('label');
    aReverseLabel.htmlFor = aReverseCheckbox.id;
    aReverseLabel.innerText = 'Reversed plane';

    aReverseCheckboxSection.appendChild(aReverseCheckbox);
    aReverseCheckboxSection.appendChild(aReverseLabel);

    const aPositionRangeSection = document.createElement('div');
    aPositionRangeSection.classList.add('plane-panel__position-range-section');
    aPlanePanel.appendChild(aPositionRangeSection);

    const aPlanePositionRange = document.createElement('input');
    aPlanePositionRange.classList.add('plane-panel__position-range');
    aPlanePositionRange.id = `position-range-${this.planeId}`;
    aPlanePositionRange.type = 'range';
    aPlanePositionRange.min = '0';
    aPlanePositionRange.max = '100';
    aPlanePositionRange.step = '1';
    aPlanePositionRange.value = `${this.value}`;
    aPlanePositionRange.oninput = (theEvent) => {
      theEvent.preventDefault();
      this.value = Number(aPlanePositionRange.value);
    };

    const aPlanePositionPercent = document.createElement('input');
    aPlanePositionPercent.classList.add('plane-panel__position-percent');
    aPlanePositionPercent.id = `position-percent-${this.planeId}`;
    aPlanePositionPercent.type = 'number';
    aPlanePositionPercent.min = '0';
    aPlanePositionPercent.max = '100';
    aPlanePositionPercent.value = `${this.value}`;
    aPlanePositionPercent.oninput = (theEvent) => {
      theEvent.preventDefault();
      this.value = Number(aPlanePositionPercent.value);
    };

    aPositionRangeSection.appendChild(aPlanePositionRange);
    aPositionRangeSection.appendChild(aPlanePositionPercent);
    aPositionRangeSection.append('%');

    const anDeletePlaneBtn = document.createElement('img');
    anDeletePlaneBtn.classList.add('plane-panel__delete-plane-btn');
    anDeletePlaneBtn.src = '/assets/images/delete.svg';
    anDeletePlaneBtn.alt = 'basket';
    anDeletePlaneBtn.onclick = () => {
      this.dispatchEvent({ type: 'deletionRequired' });
    };
    aPlanePanel.appendChild(anDeletePlaneBtn);

    return aPlanePanel;
  }
}

ClipPlane.globalClipPlaneIndex = 0;

class ClipPlaneManager extends cadex.ModelPrs_ClipPlanesManager {
  listOfClipPlanesDom: HTMLElement;
  scene: cadex.ModelPrs_Scene;
  defaultBBox: cadex.ModelData_Box;

  constructor(theScene: cadex.ModelPrs_Scene) {
    super();
    this.listOfClipPlanesDom = document.querySelector('.clip-planes') as HTMLElement;
    this.scene = theScene;
    this.defaultBBox = new cadex.ModelData_Box(new cadex.ModelData_Point(-100, -100, -100), new cadex.ModelData_Point(100, 100, 100));

    theScene.addEventListener('boundingBoxChanged', this.updatePlaneBBox.bind(this));
  }

  updatePlaneBBox() {
    let aBBox = this.scene.boundingBox;
    if (aBBox.isEmpty()) {
      aBBox = this.defaultBBox;
    }
    for (const aPlane of this.globalClipPlanes()) {
      (aPlane as ClipPlane).bbox = aBBox;
    }
  }

  override addGlobalClipPlane() {
    if (this.numberOfGlobalClipPlanes >= 3) {
      return;
    }

    const anAlreadyUsedAxes: CliPlaneAxis[] = [];
    for (const aPlane of this.globalClipPlanes()) {
      anAlreadyUsedAxes.push((aPlane as ClipPlane).axis);
    }

    const aMissingAxis = Object.values(CliPlaneAxis).filter((theAxis) => !anAlreadyUsedAxes.includes(theAxis))[0];

    let aBBox = this.scene.boundingBox;
    if (aBBox.isEmpty()) {
      aBBox = this.defaultBBox;
    }
    const aClipPlane = new ClipPlane(aBBox, aMissingAxis);
    /* Enable reverse of plane: */
    // aClipPlane.reverse = true;
    /* Disable capping of plane: */
    // aClipPlane.isCappingEnabled = false;
    /* Hide controls (arrows) of plane: */
    // aClipPlane.isShowControls = false;
    /* Hide plane on the scene: */
    // aClipPlane.isShowPlane = false;
    aClipPlane.addEventListener('deletionRequired', () => {
      this.removeGlobalClipPlane(aClipPlane);
    });

    super.addGlobalClipPlane(aClipPlane);

    this.listOfClipPlanesDom.appendChild(aClipPlane.planePanel);
  }

  override removeGlobalClipPlane(thePlane: ClipPlane) {
    super.removeGlobalClipPlane(thePlane);
    thePlane.planePanel.remove();
  }

  override removeAllGlobalClipPlanes() {
    super.removeAllGlobalClipPlanes();
    this.listOfClipPlanesDom.innerHTML = ''; /* Remove all planes from layout. */
  }
}

/** @type {Partial<SectionPanelConfig>} */
export const SectionPanelDefaultConfig = {
  title: 'Section',
};

export class SectionPanel extends BasePanel {
  /**
   * @param {SectionPanelConfig} theConfig
   */
  _selectedElements: any;
  clipPlaneManager: ClipPlaneManager;
  viewport: any;

  constructor(theConfig, scene: any, viewport: any) {
    const aConfig = /** @type {Required<SectionPanelConfig>} */ Object.assign({}, SectionPanelDefaultConfig, theConfig);
    super(aConfig);

    this.domElement.classList.add('section-panel');
    this._panelTitle.classList.add('section-panel__title');
    this._panelBody.classList.add('section-panel__body');
    this.clear(scene, viewport);
  }

  async clear(scene: any, viewport: any) {
    await this.loaddata(scene, viewport);
  }

  /**
   * @override
   */
  show() {
    super.show();
  }

  /** @protected */
  async loaddata(scene: any, viewport: any) {
    this._panelBody.replaceChildren();
    const anUnits = htmlToElement('<div class="general-btns"><button id="btn-add-plane">Add plane</button><button id="btn-clear"> Clear</button></div>');
    anUnits.appendChild(htmlToElement('<div class="clip-planes"></div>'));
    this._panelBody.append(anUnits);

    // Use custom clip plane manager with binding to UI elements
    this.clipPlaneManager = new ClipPlaneManager(scene);
    this.viewport = viewport;
    this.viewport.clipPlanesManager = this.clipPlaneManager;

    // const aClipPlaneInputHandler = new cadex.ModelPrs_ClipPlaneInputHandler(this.viewport);
    const aClipPlaneInputHandler = new cadex.ModelPrs_ClipPlaneInputHandler();
    this.viewport.inputManager.pushInputHandler(aClipPlaneInputHandler);

    aClipPlaneInputHandler.addEventListener('clipPlaneMoved', (theEvent) => {
      /** @type {ClipPlane} */ (theEvent.clipPlane as ClipPlane).onPositionChangedByScene();
    });

    // Setup UI buttons
    const addbutton = document.querySelector('#btn-add-plane');
    const clearbutton = document.querySelector('#btn-clear');
    // Setup UI buttons

    addbutton.addEventListener('click', () => {
      this.clipPlaneManager.addGlobalClipPlane();
    });

    clearbutton.addEventListener('click', () => {
      this.clipPlaneManager.removeAllGlobalClipPlanes();
    });
  }
}
