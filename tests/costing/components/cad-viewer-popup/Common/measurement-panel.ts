// import cadex from '@cadexchanger/web-toolkit';
import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';

/** @type {Partial<MeasurementPanelConfig>} */
export const MeasurementPanelDefaultConfig = {
  title: 'Measurement',
};

export class MeasurementPanel extends BasePanel {
  /**
   * @param {MeasurementPanelConfig} theConfig
   */
  _selectedElements: any;
  viewport: any;

  constructor(theConfig, scene: any, viewport: any) {
    const aConfig = /** @type {Required<MeasurementPanelConfig>} */ Object.assign({}, MeasurementPanelDefaultConfig, theConfig);
    super(aConfig);

    this.domElement.classList.add('measurements-panel');
    this._panelTitle.classList.add('measurements-panel__title');
    this._panelBody.classList.add('measurements-panel__body');
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
  async loaddata(_scene: any, _viewport: any) {
    this._panelBody.replaceChildren();
    // const anUnits = htmlToElement('<div id="measurements-mode-selector" data-measurement-mode="TwoPointDistance"><div>Measurement mode:</div><select><option value="TwoPointDistance" selected>Two-point distance</option><option value="ThreePointAngle">Three-point angle</option></select></div>');
    const anUnits = htmlToElement(
      '<div id="measurements-mode-selector" data-measurement-mode="Distance"><div>Measurement mode:</div><select><option value="Distance" selected>Two-point distance</option><option value="Angle">Three-point angle</option></select></div>'
    );
    anUnits.appendChild(htmlToElement(' <div id="length-units-selector"><div>Units:</div><select></select></div>'));
    anUnits.appendChild(htmlToElement('<div id="angle-units-selector"><div>Units:</div><select></select></div>'));
    this._panelBody.append(anUnits);
  }
}
