// import cadex from '@cadexchanger/web-toolkit';
import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';

/** @type {Partial<SelectionHandlingPanelConfig>} */
export const SelectionHandlingPanelDefaultConfig = {
  title: 'SelectionHandling',
};

export class SelectionHandlingPanel extends BasePanel {
  /**
   * @param {SelectionHandlingPanelConfig} theConfig
   */
  _selectedElements: any;
  viewport: any;

  constructor(theConfig, scene: any, viewport: any) {
    const aConfig = /** @type {Required<SelectionHandlingPanelConfig>} */ Object.assign({}, SelectionHandlingPanelDefaultConfig, theConfig);
    super(aConfig);

    this.domElement.classList.add('selection-handling-panel');
    this._panelTitle.classList.add('selection-handling-panel__title');
    this._panelBody.classList.add('selection-handling-panel__body');
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

  //ExpCustom
  updateContent(content: any = '') {
    this._panelBody.removeChild(document.getElementById('custom-selected-entity-details'));
    const anEntityDetails = htmlToElement(`<div id="custom-selected-entity-details"></div>`);
    anEntityDetails.appendChild(htmlToElement('<h6 class="heading-label">Selected Entity Details</h6>'));
    content && anEntityDetails.appendChild(content);
    !content && anEntityDetails.appendChild(anEntityDetails.appendChild(htmlToElement('<div class="empty-label">Select an element</div>')));
    this._panelBody.append(anEntityDetails);
  }

  //ExpCustom
  async loaddata(_scene: any, _viewport: any) {
    this._panelBody.replaceChildren();
    const anUnits = htmlToElement(`<div id="selection-mode-selector">
    <div>Selection Mode:</div>
    <select>    
        <option value="Solid">Body/Part</option>
        <option value="Face">Face/Plane</option>
        <option value="Edge">Line/Curve</option>
    </select>
    </div>`);

    // <optgroup label="Common">
    //   <option value="None" selected>None</option>
    // </optgroup>
    // <optgroup label="For Poly entities" disabled>
    //   <option value="PolyShape">PolyShape</option>
    //   <option value="PolyFace">PolyFace</option>
    //   <option value="PolyLine">PolyLine</option>
    //   <option value="PolyVertex">PolyVertex</option>
    // </optgroup>
    // <optgroup label="For B-Rep entities" disabled>
    //   <option value="Body">Body</option>
    // <option value="Shell">Shell</option>
    //   <option value="Wire">Wire</option>
    //   <option value="Vertex">Vertex</option>
    // </optgroup>
    const anEntityDetails = htmlToElement('<div id="custom-selected-entity-details"></div>');
    anEntityDetails.appendChild(htmlToElement('<div class="empty-label">Select an element</div>'));
    this._panelBody.append(anUnits);
    this._panelBody.append(anEntityDetails);
  }
}
