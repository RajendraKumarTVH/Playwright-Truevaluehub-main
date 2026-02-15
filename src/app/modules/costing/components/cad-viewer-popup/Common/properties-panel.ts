import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';
import cadex from '@cadexchanger/web-toolkit';

export interface PropertiesPanelConfig {
  domElement: HTMLElement;
  title?: string;
}

export const PropertiesPanelDefaultConfig: Partial<PropertiesPanelConfig> = {
  title: 'Properties',
};

export class PropertiesPanel extends BasePanel {
  constructor(theConfig: PropertiesPanelConfig) {
    const aConfig = Object.assign({}, PropertiesPanelDefaultConfig, theConfig) as Required<PropertiesPanelConfig>;
    super(aConfig);

    this.domElement.classList.add('properties-panel');
    this._panelTitle.classList.add('properties-panel__title');
    this._panelBody.classList.add('properties-panel__body');
  }

  override show() {
    this.update();
    super.show();
  }

  protected async update() {
    this._panelBody.replaceChildren();
    this._panelBody.appendChild(htmlToElement('<div class="properties-panel__empty-label">Select an element</div>'));
  }

  createPropertiesGroup(theGroupName: string, theProperties: Record<string, string | number | Date | cadex.ModelData_Point | cadex.ModelData_Box | null | undefined>) {
    const aGroupBody = Object.keys(theProperties)
      .map(
        (theName) =>
          `<div class="properties-panel__property">
        <div class="properties-panel__property-name">${theName}</div>
        <div class="properties-panel__property-value">${theProperties[theName]}</div>
      </div>`
      )
      .join('');

    const aGroup = htmlToElement(
      `<div class="properties-panel__group">
        <div class="properties-panel__group-body">
          ${aGroupBody}
        </div>
      </div>`
    );

    const anExpandButton = htmlToElement(`<button type="button" class="properties-panel__group-collapse-button">${theGroupName}</button>`);
    anExpandButton.addEventListener('click', () => {
      aGroup.classList.toggle('properties-panel__group_collapsed');
    });

    const aGroupTitle = htmlToElement('<h6 class="properties-panel__group-title"></h6>');
    aGroupTitle.appendChild(anExpandButton);
    aGroup.prepend(aGroupTitle);

    return aGroup;
  }

  static enumValue<V>(theEnum: Record<string, V>, theValue: V): string | undefined {
    return Object.keys(theEnum).find((v) => theEnum[v] === theValue);
  }
}
