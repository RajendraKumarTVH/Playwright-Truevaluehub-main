// import cadex from '@cadexchanger/web-toolkit';
import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';

/** @type {Partial<PMIPanelConfig>} */
export const PMIPanelDefaultConfig = {
  title: 'PMI',
};

export class PMIPanel extends BasePanel {
  /**
   * @param {PMIPanelConfig} theConfig
   */
  _selectedElements: any;
  viewport: any;

  constructor(theConfig, scene: any, viewport: any) {
    const aConfig = /** @type {Required<PMIPanelConfig>} */ Object.assign({}, PMIPanelDefaultConfig, theConfig);
    super(aConfig);

    this.domElement.classList.add('pmi-panel');
    this._panelTitle.classList.add('pmi-panel__title');
    this._panelBody.classList.add('pmi-panel__body');
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
    const anUnits = htmlToElement(
      '<div id="file-pmi-container"><div id="file-pmi-saved-views"><span>Select a view:</span><select id="file-pmi-saved-views-select"></select></div><div id="file-pmi-elements"></div></div>'
    );
    this._panelBody.append(anUnits);
  }
}
