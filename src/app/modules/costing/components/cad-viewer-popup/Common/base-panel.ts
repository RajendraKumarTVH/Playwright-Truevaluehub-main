import cadex from '@cadexchanger/web-toolkit';
import { htmlToElement } from './dom';

export interface BasePanelConfig {
  title: string;
  domElement: HTMLElement;
  showCloseButton?: boolean;
}

export const BasePanelDefaultConfig: Partial<BasePanelConfig> = {
  showCloseButton: true,
};

export class BasePanel extends cadex.ModelPrs_EventDispatcher {
  domElement: HTMLElement;
  protected _panelBody: HTMLElement;
  protected _panelTitle: HTMLElement;

  constructor(theConfig: BasePanelConfig) {
    super();

    const aConfigWithDefaults = Object.assign({}, BasePanelDefaultConfig, theConfig) as Required<BasePanelConfig>;

    this.domElement = theConfig.domElement;
    this.domElement.classList.add('base-panel');

    this._panelTitle = htmlToElement(
      `<div class="base-panel__title">
        <h5>${theConfig.title}</h5>
      </div>`
    );

    if (aConfigWithDefaults.showCloseButton) {
      const aPanelCloseButton = htmlToElement(
        `<button type="button" title="Close" class="base-panel__close-button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>`
      );
      aPanelCloseButton.addEventListener('click', () => this.hide());
      this._panelTitle.append(aPanelCloseButton);
    }

    this._panelBody = htmlToElement('<div class="base-panel__body"></div>');

    this.domElement.appendChild(this._panelTitle);
    this.domElement.appendChild(this._panelBody);
  }

  get isShown() {
    return !this.domElement.classList.contains('base-panel__menu_hidden');
  }

  show() {
    this.domElement.classList.remove('base-panel__menu_hidden');
    this.dispatchEvent({ type: 'show' });
  }

  hide() {
    this.domElement.classList.add('base-panel__menu_hidden');
    this.dispatchEvent({ type: 'hide' });
  }
}
