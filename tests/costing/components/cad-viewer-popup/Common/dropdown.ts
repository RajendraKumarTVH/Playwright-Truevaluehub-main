import { createPopper, type Instance as PopperInstance, OptionsGeneric, Placement, type StrictModifiers } from '@popperjs/core';
import { htmlToElement } from './dom';

export interface DropdownConfig {
  menuPlacement: Placement;
  menuOffsetSkidding: number;
  menuOffsetDistance: number;
}

export class Dropdown {
  popperConfig: Partial<OptionsGeneric<StrictModifiers>>;
  button: HTMLButtonElement;
  menu: HTMLElement;
  domElement: HTMLElement;
  popperInstance!: PopperInstance;

  constructor(theButton: HTMLButtonElement, theMenu: HTMLElement, theConfig: DropdownConfig) {
    this.popperConfig = {
      placement: theConfig.menuPlacement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [theConfig.menuOffsetSkidding, theConfig.menuOffsetDistance],
          },
        },
      ],
    };

    this.button = theButton;
    this.button.classList.add('dropdown__toggle');
    this.button.addEventListener('click', () => this.toggle());

    this.menu = theMenu;
    this.menu.classList.add('dropdown__menu', 'dropdown__menu_hidden');

    this.domElement = htmlToElement('<div class="dropdown"></div>');
    this.domElement.appendChild(this.button);
    this.domElement.appendChild(this.menu);

    this._onClickOutsideMenu = this._onClickOutsideMenu.bind(this);
  }

  private _onClickOutsideMenu(theEvent) {
    const aComposedPath = theEvent.composedPath();
    if (!aComposedPath.includes(this.menu) && !aComposedPath.includes(this.button)) {
      this.hide();
    }
  }

  isShown() {
    return !this.menu.classList.contains('dropdown__menu_hidden');
  }

  toggle() {
    if (this.isShown()) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.isShown()) {
      return;
    }
    // Connect menu with button click
    this.popperInstance = createPopper<StrictModifiers>(this.button, this.menu, this.popperConfig);
    this.button.classList.add('dropdown__toggle_active');
    this.menu.classList.remove('dropdown__menu_hidden');
    document.addEventListener('click', this._onClickOutsideMenu);
  }

  hide() {
    if (!this.isShown()) {
      return;
    }

    this.button.classList.remove('dropdown__toggle_active');
    this.menu.classList.add('dropdown__menu_hidden');
    if (this.popperInstance) {
      this.popperInstance.destroy();
    }
    document.removeEventListener('click', this._onClickOutsideMenu);
  }
}
