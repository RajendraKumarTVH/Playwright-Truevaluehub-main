import { Dropdown } from './dropdown';
import { Placement } from '@popperjs/core';
import cadex from '@cadexchanger/web-toolkit';
import { htmlToElement } from './dom';

export interface ViewerToolsConfig {
  viewport: cadex.ModelPrs_ViewPort;
  domElement?: HTMLElement;
  displayMode?: cadex.ModelPrs_DisplayMode;
  cameraProjectionType?: cadex.ModelPrs_CameraProjectionType;
  theme?: 'light' | 'dark';
  showStructureButton?: boolean;
  showDisplayOptions?: boolean;
  displayOptionsConfig?: {
    showDisplayMode?: boolean;
    showCameraProjectionType?: boolean;
    showTheme?: boolean;
  };
  showFitAllButton?: boolean;
  showExplode?: boolean;
  showPropertiesButton?: boolean;
  showSectioningButton?: boolean;
  showPmiButton?: boolean;
  showSelectionHandlingButton?: boolean;
  showDfmButton?: boolean;
  showNoteButton?: boolean;
  showMeasurementButton?: boolean;
  showScreenshotButton?: boolean;
  dropDownMenuPlacement?: Placement;
  dropDownMenuOffsetSkidding?: number;
  dropDownMenuOffsetDistance?: number;
}

export const ViewerToolsDefaultConfig: Partial<ViewerToolsConfig> = {
  displayMode: cadex.ModelPrs_DisplayMode.Shaded,
  cameraProjectionType: cadex.ModelPrs_CameraProjectionType.Isometric,
  theme: 'light',
  showStructureButton: true,
  showDisplayOptions: true,
  displayOptionsConfig: {
    showDisplayMode: true,
    showCameraProjectionType: true,
    showTheme: false, //ExpCustom
  },
  showFitAllButton: true,
  showExplode: true,
  showPropertiesButton: true,
  showSectioningButton: true,
  showPmiButton: true,
  showSelectionHandlingButton: false,
  showDfmButton: true,
  showNoteButton: true,
  showMeasurementButton: true,
  showScreenshotButton: false, //ExpCustom
  dropDownMenuPlacement: 'bottom-start',
  dropDownMenuOffsetSkidding: 0,
  dropDownMenuOffsetDistance: 8,
};

export class ViewerTools extends cadex.ModelPrs_EventDispatcher {
  viewport: cadex.ModelPrs_ViewPort;
  domElement: HTMLElement;
  protected _structureButtonActive: boolean;
  protected _propertiesButtonActive: boolean;
  protected _sectioningButtonActive: boolean;
  protected _pmiButtonActive: boolean;
  protected _selectionHandlingButtonActive: boolean;
  protected _dfmButtonActive: boolean;
  protected _noteButtonActive: boolean;
  protected _measurementButtonActive: boolean;
  protected _displayMode: cadex.ModelPrs_DisplayMode;
  protected _displayModeButtons: HTMLButtonElement[];
  protected _cameraProjectionType: cadex.ModelPrs_CameraProjectionType;
  protected _cameraProjectionTypeButtons: HTMLButtonElement[];
  protected _theme: 'light' | 'dark';
  protected _themeButtons: Record<string, HTMLButtonElement>;
  protected _structureButton!: HTMLButtonElement;
  protected _displayOptionsDropDown!: Dropdown;
  protected _fitAllButton!: HTMLElement;
  protected _explodeSliderInput!: HTMLInputElement;
  protected _explodeSliderValue!: HTMLDivElement;
  protected _explodeDropDown!: Dropdown;
  protected _propertiesButton!: HTMLButtonElement;
  protected _sectioningButton!: HTMLButtonElement;
  protected _pmiButton!: HTMLButtonElement;
  protected _selectionHandlingButton!: HTMLButtonElement;
  protected _dfmButton!: HTMLButtonElement;
  protected _noteButton!: HTMLButtonElement;
  protected _measurementButton!: HTMLButtonElement;
  protected _screenshotButton!: HTMLButtonElement;
  protected _displayOptionsButton!: HTMLButtonElement;
  protected _displayOptionsMenu!: HTMLElement;
  protected _explodeMenu!: HTMLElement;
  protected _explodeButton!: HTMLElement;

  constructor(theConfig: ViewerToolsConfig) {
    super();

    this.viewport = theConfig.viewport;
    if (theConfig.domElement) {
      this.domElement = theConfig.domElement;
    } else {
      this.domElement = document.createElement('div');
      theConfig.viewport.domElement.appendChild(this.domElement);
    }
    this.domElement.classList.add('viewer-tools');

    const aConfigWithDefaults = Object.assign({}, ViewerToolsDefaultConfig, theConfig) as Required<ViewerToolsConfig>;
    aConfigWithDefaults.displayOptionsConfig = Object.assign({}, ViewerToolsDefaultConfig.displayOptionsConfig, theConfig.displayOptionsConfig);

    this._structureButtonActive = false;
    this._propertiesButtonActive = false;
    this._pmiButtonActive = false;
    this._selectionHandlingButtonActive = false;
    this._dfmButtonActive = false;
    this._noteButtonActive = false;
    this._measurementButtonActive = false;
    this._displayMode = aConfigWithDefaults.displayMode;
    this._displayModeButtons = [];
    this._cameraProjectionType = aConfigWithDefaults.cameraProjectionType;
    this._cameraProjectionTypeButtons = [];
    this._theme = aConfigWithDefaults.theme;
    this._themeButtons = {};
    this._sectioningButtonActive = false;

    if (aConfigWithDefaults.showStructureButton) {
      this._structureButton = htmlToElement(
        `<button type="button" title="Structure" class="viewer-tools__button viewer-tools__structure-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_2105_1436" fill="white">
              <rect x="7" width="10" height="10" rx="1"/>
            </mask>
            <rect x="7" width="10" height="10" rx="1" stroke="currentColor" stroke-width="3" mask="url(#path-1-inside-1_2105_1436)"/>
            <mask id="path-2-inside-2_2105_1436" fill="white">
              <rect y="16" width="6" height="6" rx="1"/>
            </mask>
            <rect y="16" width="6" height="6" rx="1" stroke="currentColor" stroke-width="3" mask="url(#path-2-inside-2_2105_1436)"/>
            <path d="M12 9V16" stroke="currentColor" stroke-width="1.5"/>
            <mask id="path-4-inside-3_2105_1436" fill="white">
              <rect x="9" y="16" width="6" height="6" rx="1"/>
            </mask>
            <rect x="9" y="16" width="6" height="6" rx="1" stroke="currentColor" stroke-width="3" mask="url(#path-4-inside-3_2105_1436)"/>
            <mask id="path-5-inside-4_2105_1436" fill="white">
              <rect x="18" y="16" width="6" height="6" rx="1"/>
            </mask>
            <rect x="18" y="16" width="6" height="6" rx="1" stroke="currentColor" stroke-width="3" mask="url(#path-5-inside-4_2105_1436)"/>
            <path d="M3 16V14C3 13.4477 3.44772 13 4 13H20C20.5523 13 21 13.4477 21 14V16" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>`
      ) as HTMLButtonElement;
      this._structureButton.addEventListener('click', () => {
        this.structureButtonActive = !this.structureButtonActive;
      });
      this.domElement.appendChild(this._structureButton);
    }

    if (aConfigWithDefaults.showDisplayOptions) {
      const aDisplayOptionsButton = htmlToElement(
        `<button type="button" title="Display Options" class="viewer-tools__button viewer-tools__display-options-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 3 11.5 C 3 11.5 6.309 5 12.1 5 C 17.891 5 21.2 11.5 21.2 11.5 C 21.2 11.5 17.891 18 12.1 18 C 6.309 18 3 11.5 3 11.5 Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M 12.1 14.1 C 13.536 14.1 14.7 12.936 14.7 11.5 C 14.7 10.064 13.536 8.9 12.1 8.9 C 10.664 8.9 9.5 10.064 9.5 11.5 C 9.5 12.936 10.664 14.1 12.1 14.1 Z" fill="transparency" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M 5 1 L 1.1 1 C 1.045 1 1 1.045 1 1.1 L 1 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M 1 19 L 1 22.9 C 1 22.955 1.045 23 1.1 23 L 5 23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M 19 23 L 22.9 23 C 22.955 23 23 22.955 23 22.9 L 23 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M 23 5 L 23 1.1 C 23 1.045 22.955 1 22.9 1 L 19 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </button>`
      ) as HTMLButtonElement;

      this._displayOptionsButton = aDisplayOptionsButton;

      // Create menu
      const aDisplayOptionsMenu = htmlToElement('<div class="viewer-tools__display-options-menu"></div>');

      if (aConfigWithDefaults.displayOptionsConfig.showDisplayMode) {
        // Create menu buttons
        const aWireframeDisplayModeButton = htmlToElement(
          `<button type="button" title="Wireframe" class="viewer-tools__display-options-menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.2903 12L3 7.5M12.2903 12L16.3548 9.94286L21 7.5M12.2903 12V20.4375M3 7.5V16.0619C3 16.2516 3.10729 16.4249 3.27703 16.5095L12.06 20.8852C12.2045 20.9573 12.375 20.955 12.5176 20.8792L20.7346 16.5124C20.8979 16.4257 21 16.2558 21 16.0709V7.5M3 7.5L12.0651 3.10907C12.2069 3.04042 12.3727 3.04256 12.5126 3.11485L21 7.5" stroke="currentColor"></path>
            </svg>
            <span>Wireframe</span>
          </button>`
        ) as HTMLButtonElement;

        const aShadingDisplayModeButton = htmlToElement(
          `<button class="viewer-tools__display-options-menu-item" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 16.5V7.5L12 12V21L3 16.5Z" fill="#6F6F6F"></path>
              <path d="M21 16.5V7.5L12 12V21L21 16.5Z" fill="#8C8C8C"></path>
              <path d="M21 7.5L12 3L3 7.5L12 12L21 7.5Z" fill="#B7B7B7"></path>
            </svg>
            <span>Shading</span>
          </button>`
        ) as HTMLButtonElement;

        const aShadingWithBoundariesDisplayModeButton = htmlToElement(
          `<button type="button" title="Shading with boundaries" class="viewer-tools__display-options-menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 16.5V7.5L12 12V21L3 16.5Z" fill="#8B8B8B"></path>
              <path d="M20.5 16.5V7.5L12 12V21L20.5 16.5Z" fill="#AEAEAE"></path>
              <path d="M19.875 7.5L12 3L3.5625 7.5L12 12L19.875 7.5Z" fill="#D3D3D3"></path>
              <path d="M12 12L3 7.5M12 12L15.9375 9.94286L20.4375 7.5M12 12V20.4375M3 7.5V16.0663C3 16.2537 3.10473 16.4253 3.27133 16.511L11.7638 20.8785C11.9115 20.9545 12.0873 20.9521 12.2329 20.8722L20.178 16.5138C20.338 16.426 20.4375 16.258 20.4375 16.0754V7.5M3 7.5L11.769 3.1155C11.9139 3.04305 12.0849 3.0453 12.2279 3.12154L20.4375 7.5" stroke="white"></path>
            </svg>
            <span>Shading with boundaries</span>
          </button>`
        ) as HTMLButtonElement;

        this._displayModeButtons[cadex.ModelPrs_DisplayMode.Wireframe] = aWireframeDisplayModeButton;
        this._displayModeButtons[cadex.ModelPrs_DisplayMode.Shaded] = aShadingDisplayModeButton;
        this._displayModeButtons[cadex.ModelPrs_DisplayMode.ShadedWithBoundaries] = aShadingWithBoundariesDisplayModeButton;

        // Highlight current mode
        this._displayModeButtons[this._displayMode].classList.add('viewer-tools__display-options-menu-item_active');

        // Add click handlers for buttons
        this._displayModeButtons.forEach((theButton, theMode) => {
          theButton.addEventListener('click', () => {
            this.displayMode = theMode;
          });
        });

        aDisplayOptionsMenu.appendChild(htmlToElement('<h6 class="viewer-tools__display-options-menu-header">Display mode</h6>'));
        this._displayModeButtons.forEach((theButton) => aDisplayOptionsMenu.appendChild(theButton));
        aDisplayOptionsMenu.appendChild(htmlToElement('<hr class="viewer-tools__display-options-menu-divider"></hr>'));
      }

      if (aConfigWithDefaults.displayOptionsConfig.showCameraProjectionType) {
        const anIsometricCameraProjectionModeButton = htmlToElement(
          `<button type="button" title="Isometric" class="viewer-tools__display-options-menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8.5V19.5H15M4 8.5H15M4 8.5L8.5 4H19M15 19.5V8.5M15 19.5L19 15V4M15 8.5L19 4" stroke="currentColor"></path>
            </svg>
            <span>Isometric</span>
          </button>`
        ) as HTMLButtonElement;

        const aPerspectiveCameraProjectionModeButton = htmlToElement(
          `<button type="button" title="Perspective" class="viewer-tools__display-options-menu-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8.5V19.5H15M4 8.5H15M4 8.5L15 4H19.5M15 19.5V8.5M15 19.5L19.5 8V4M15 8.5L19.5 4" stroke="currentColor"></path>
            </svg>
            <span>Perspective</span>
          </button>`
        ) as HTMLButtonElement;

        this._cameraProjectionTypeButtons[cadex.ModelPrs_CameraProjectionType.Isometric] = anIsometricCameraProjectionModeButton;
        this._cameraProjectionTypeButtons[cadex.ModelPrs_CameraProjectionType.Perspective] = aPerspectiveCameraProjectionModeButton;

        // Highlight current mode
        this._cameraProjectionTypeButtons[this._cameraProjectionType].classList.add('viewer-tools__display-options-menu-item_active');

        // Add click handlers for buttons
        this._cameraProjectionTypeButtons.forEach((theButton, theMode) => {
          theButton.addEventListener('click', () => {
            this.cameraProjectionType = theMode;
          });
        });

        aDisplayOptionsMenu.appendChild(htmlToElement('<h6 class="viewer-tools__display-options-menu-header">Camera projection mode</h6>'));
        this._cameraProjectionTypeButtons.forEach((theButton) => aDisplayOptionsMenu.appendChild(theButton));
        aDisplayOptionsMenu.appendChild(htmlToElement('<hr class="viewer-tools__display-options-menu-divider"></hr>'));
      }

      if (aConfigWithDefaults.displayOptionsConfig.showTheme) {
        const aLightThemeButton = htmlToElement(
          `<button type="button" title="Perspective" class="viewer-tools__display-options-menu-item">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9014 3.50009C11.9014 3.77623 12.1252 4.00009 12.4014 4.00009C12.6775 4.00009 12.9014 3.77623 12.9014 3.50009H11.9014ZM12.9014 1.50009C12.9014 1.22395 12.6775 1.00009 12.4014 1.00009C12.1252 1.00009 11.9014 1.22395 11.9014 1.50009H12.9014ZM12.9014 19.5001C12.9014 19.2239 12.6775 19.0001 12.4014 19.0001C12.1252 19.0001 11.9014 19.2239 11.9014 19.5001H12.9014ZM11.9014 21.5001C11.9014 21.7762 12.1252 22.0001 12.4014 22.0001C12.6775 22.0001 12.9014 21.7762 12.9014 21.5001H11.9014ZM6.46203 6.26786C6.65729 6.46312 6.97387 6.46312 7.16913 6.26786C7.3644 6.0726 7.3644 5.75601 7.16913 5.56075L6.46203 6.26786ZM5.75492 4.14654C5.55966 3.95128 5.24308 3.95128 5.04781 4.14654C4.85255 4.3418 4.85255 4.65838 5.04781 4.85364L5.75492 4.14654ZM18.4829 16.8744C18.2877 16.6792 17.9711 16.6792 17.7758 16.8744C17.5806 17.0697 17.5806 17.3863 17.7758 17.5816L18.4829 16.8744ZM19.1901 18.9958C19.3853 19.191 19.7019 19.191 19.8972 18.9958C20.0924 18.8005 20.0924 18.4839 19.8972 18.2887L19.1901 18.9958ZM4.40137 12.0001C4.67751 12.0001 4.90137 11.7762 4.90137 11.5001C4.90137 11.2239 4.67751 11.0001 4.40137 11.0001V12.0001ZM2.40137 11.0001C2.12522 11.0001 1.90137 11.2239 1.90137 11.5001C1.90137 11.7762 2.12522 12.0001 2.40137 12.0001V11.0001ZM20.4014 11.0001C20.1252 11.0001 19.9014 11.2239 19.9014 11.5001C19.9014 11.7762 20.1252 12.0001 20.4014 12.0001V11.0001ZM22.4014 12.0001C22.6775 12.0001 22.9014 11.7762 22.9014 11.5001C22.9014 11.2239 22.6775 11.0001 22.4014 11.0001V12.0001ZM17.7763 5.56075C17.5811 5.75601 17.5811 6.0726 17.7763 6.26786C17.9716 6.46312 18.2882 6.46312 18.4834 6.26786L17.7763 5.56075ZM19.8976 4.85364C20.0929 4.65838 20.0929 4.3418 19.8976 4.14654C19.7024 3.95128 19.3858 3.95128 19.1905 4.14654L19.8976 4.85364ZM7.16962 17.5816C7.36488 17.3863 7.36488 17.0697 7.16962 16.8744C6.97436 16.6792 6.65778 16.6792 6.46252 16.8744L7.16962 17.5816ZM5.0483 18.2887C4.85304 18.4839 4.85304 18.8005 5.0483 18.9958C5.24356 19.191 5.56015 19.191 5.75541 18.9958L5.0483 18.2887ZM12.4014 16.0001C9.91609 16.0001 7.90137 13.9854 7.90137 11.5001H6.90137C6.90137 14.5377 9.3638 17.0001 12.4014 17.0001V16.0001ZM7.90137 11.5001C7.90137 9.01481 9.91609 7.00009 12.4014 7.00009V6.00009C9.3638 6.00009 6.90137 8.46253 6.90137 11.5001H7.90137ZM12.4014 7.00009C14.8866 7.00009 16.9014 9.01481 16.9014 11.5001H17.9014C17.9014 8.46253 15.4389 6.00009 12.4014 6.00009V7.00009ZM16.9014 11.5001C16.9014 13.9854 14.8866 16.0001 12.4014 16.0001V17.0001C15.4389 17.0001 17.9014 14.5377 17.9014 11.5001H16.9014ZM12.9014 3.50009V1.50009H11.9014V3.50009H12.9014ZM11.9014 19.5001V21.5001H12.9014V19.5001H11.9014ZM7.16913 5.56075L5.75492 4.14654L5.04781 4.85364L6.46203 6.26786L7.16913 5.56075ZM17.7758 17.5816L19.1901 18.9958L19.8972 18.2887L18.4829 16.8744L17.7758 17.5816ZM4.40137 11.0001H2.40137V12.0001H4.40137V11.0001ZM20.4014 12.0001H22.4014V11.0001H20.4014V12.0001ZM18.4834 6.26786L19.8976 4.85364L19.1905 4.14654L17.7763 5.56075L18.4834 6.26786ZM6.46252 16.8744L5.0483 18.2887L5.75541 18.9958L7.16962 17.5816L6.46252 16.8744Z" fill="currentColor"/>
          </svg>
          <span>Light</span>
        </button>`
        ) as HTMLButtonElement;

        const aDarkThemeButton = htmlToElement(
          `<button type="button" title="Perspective" class="viewer-tools__display-options-menu-item">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.40137 5.50009C9.40137 10.4707 13.4308 14.5001 18.4014 14.5001C19.3106 14.5001 20.1884 14.3652 21.0158 14.1145C19.8957 17.81 16.4627 20.5001 12.4014 20.5001C7.4308 20.5001 3.40137 16.4707 3.40137 11.5001C3.40137 7.4388 6.09144 4.0058 9.78697 2.88571C9.5362 3.71308 9.40137 4.59083 9.40137 5.50009Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Dark</span>
        </button>`
        ) as HTMLButtonElement;
        this._themeButtons.light = aLightThemeButton;
        this._themeButtons.dark = aDarkThemeButton;

        // Highlight current mode
        this._themeButtons[this._theme].classList.add('viewer-tools__display-options-menu-item_active');

        // Add click handlers for buttons
        Object.keys(this._themeButtons).forEach((theTheme) => {
          this._themeButtons[theTheme].addEventListener('click', () => {
            this.theme = theTheme as typeof this.theme;
          });
        });

        aDisplayOptionsMenu.appendChild(htmlToElement('<h6 class="viewer-tools__display-options-menu-header">Theme</h6>'));
        Object.keys(this._themeButtons).forEach((theThemeName) => aDisplayOptionsMenu.appendChild(this._themeButtons[theThemeName]));
      }

      this._displayOptionsMenu = aDisplayOptionsMenu;

      this._displayOptionsDropDown = new Dropdown(aDisplayOptionsButton, aDisplayOptionsMenu, {
        menuPlacement: aConfigWithDefaults.dropDownMenuPlacement,
        menuOffsetDistance: aConfigWithDefaults.dropDownMenuOffsetDistance,
        menuOffsetSkidding: aConfigWithDefaults.dropDownMenuOffsetSkidding,
      });

      this._displayOptionsDropDown.domElement.classList.add('viewer-tools__display-options');
      this.domElement.appendChild(this._displayOptionsDropDown.domElement);
    }

    if (aConfigWithDefaults.showFitAllButton) {
      this._fitAllButton = htmlToElement(
        `<button type="button" title="Fit All" class="viewer-tools__button viewer-tools__fit-all-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10.117" cy="11.171" r="5.421" stroke="currentColor" stroke-width="1.5"></circle>
            <path d="M 14.319 15.371 L 19.304 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M5 1H1.1C1.04477 1 1 1.04477 1 1.1V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M1 19L1 22.9C1 22.9552 1.04477 23 1.1 23L5 23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M 19 23 L 22.9 23 C 22.955 23 23 22.955 23 22.9 L 23 19" stroke-width="1.5" stroke-linecap="round" stroke="currentColor"></path>
            <path d="M 23 5 L 23 1.1 C 23 1.045 22.955 1 22.9 1 L 19 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </button>`
      ) as HTMLButtonElement;

      this._fitAllButton.addEventListener('click', () => {
        this.viewport.fitAll(5);
      });
      this.domElement.appendChild(this._fitAllButton);
    }

    if (aConfigWithDefaults.showExplode) {
      const anExplodeButton = htmlToElement(
        `<button type="button" title="Explode" class="viewer-tools__button viewer-tools__explode-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 21.6634V12.7883C13 12.7136 13.0416 12.6451 13.1079 12.6107L21.7079 8.15144C21.8411 8.08241 22 8.17903 22 8.32899V16.9812C22 17.0544 21.96 17.1218 21.8956 17.1568L13.2956 21.839C13.1624 21.9116 13 21.8151 13 21.6634Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 21.6761V12.632C10 12.5563 9.95726 12.4871 9.88958 12.4532L1.28958 8.14506C1.15659 8.07844 1 8.17514 1 8.32388V17.368C1 17.4437 1.04274 17.5129 1.11042 17.5468L9.71042 21.8549C9.84341 21.9216 10 21.8249 10 21.6761Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M11.4091 9.45652L3.36095 5.60544C3.21226 5.53429 3.20864 5.32392 3.3548 5.2477L11.4121 1.04585C11.4675 1.01696 11.5332 1.01562 11.5897 1.04222L19.6378 4.82956C19.787 4.89976 19.7919 5.11015 19.6462 5.18728L11.589 9.45287C11.533 9.48251 11.4663 9.48387 11.4091 9.45652Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>`
      ) as HTMLButtonElement;

      this._explodeButton = anExplodeButton;

      // Create menu
      const anExplodeMenu = htmlToElement(
        `<div class="viewer-tools__explode-menu">
          <h6 class="viewer-tools__explode-menu-header">
            Explode value
          </h6>
        </div>`
      );

      this._explodeSliderInput = htmlToElement('<input type="range" min="0" max="100" value="0" title="Explode value slider">') as HTMLInputElement;
      this._explodeSliderValue = htmlToElement('<div class="viewer-tools__explode-menu-slider-value">0%</div>') as HTMLDivElement;

      this._explodeSliderInput.addEventListener('input', (theEvent) => {
        this.explodeValuePercentages = parseInt((theEvent.target as HTMLInputElement).value);
      });

      const anExplodeResetButton = htmlToElement('<button type="button" title="Reset explode value" class="viewer-tools__explode-menu-reset-button">Reset</button>') as HTMLButtonElement;
      anExplodeResetButton.addEventListener('click', () => {
        this.explodeValuePercentages = 0;
      });

      const anExplodeSlider = htmlToElement('<div class="viewer-tools__explode-menu-slider"></div>');
      anExplodeSlider.appendChild(this._explodeSliderInput);
      anExplodeSlider.appendChild(this._explodeSliderValue);

      anExplodeMenu.appendChild(anExplodeSlider);
      anExplodeMenu.appendChild(anExplodeResetButton);

      this._explodeMenu = anExplodeMenu;

      this._explodeDropDown = new Dropdown(anExplodeButton, anExplodeMenu, {
        menuPlacement: aConfigWithDefaults.dropDownMenuPlacement,
        menuOffsetDistance: aConfigWithDefaults.dropDownMenuOffsetDistance,
        menuOffsetSkidding: aConfigWithDefaults.dropDownMenuOffsetSkidding,
      });

      this._explodeDropDown.domElement.classList.add('viewer-tools__explode');
      this.domElement.appendChild(this._explodeDropDown.domElement);
    }

    if (aConfigWithDefaults.showSectioningButton) {
      // this._sectioningButton = htmlToElement(
      //   `<button type="button" title="Clip Plane" class="viewer-tools__button viewer-tools__sectioning-button">
      //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      //       <path d="M22.3125 12.5466V16.4009C22.3121 16.7868 22.2025 17.1658 21.9946 17.4998C21.7868 17.8339 21.4881 18.1114 21.1285 18.3043L17.8129 20.0648M22.3125 12.5466V6.86386C22.3125 6.49195 22.1061 6.15076 21.7767 5.97812L12.8403 1.2948C12.4803 1.10167 12.0719 1 11.6563 1C11.2406 1 10.8322 1.10167 10.4722 1.2948L2.18403 5.69571C1.82439 5.88865 1.52568 6.16607 1.31787 6.50015C1.11005 6.83423 1.00043 7.21322 1 7.5991V16.4009C1.00043 16.7868 1.11005 17.1658 1.31787 17.4998C1.52568 17.8339 1.82439 18.1114 2.18403 18.3043L10.4722 22.7052C10.8322 22.8983 11.2406 23 11.6563 23C12.0719 23 12.4803 22.8983 12.8403 22.7052L14.9525 21.5836L15.6676 21.2039L16.3827 20.8242L17.8129 20.0648M22.3125 12.5466L17.8129 20.0648M21.5997 7.08075L12.476 22.3851" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      //       <path d="M1.81967 6.5L11.9057 12L16.7527 9.26708M21.5997 6.53416L16.7527 9.26708M16.7527 9.26708L11.9057 16.9193" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      //       <path d="M11.9638 22.5111L11.9057 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      //     </svg>
      //   </button>`
      // ) as HTMLButtonElement;
      this._sectioningButton = htmlToElement(
        `<button type="button" title="Section Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg width="24" height="24" viewBox="13.000995635986328 12.999994277954102 21.312999725341797 22.000272750854492" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34.313 24.547V28.4a2.076 2.076 0 0 1 -0.318 1.099 2.291 2.291 0 0 1 -0.866 0.804l-3.316 1.76m4.5 -7.517v-5.683a1 1 0 0 0 -0.536 -0.886l-8.937 -4.683a2.509 2.509 0 0 0 -1.183 -0.294c-0.415 0 -0.824 0.102 -1.184 0.295l-8.288 4.399a2.3 2.3 0 0 0 -0.866 0.805 2.08 2.08 0 0 0 -0.318 1.1v8.8c0 0.387 0.11 0.766 0.318 1.1a2.288 2.288 0 0 0 0.866 0.804l8.288 4.401a2.514 2.514 0 0 0 2.368 0l2.113 -1.121 0.715 -0.38 0.715 -0.38 1.43 -0.76m4.5 -7.517 -4.5 7.518M33.6 19.08 24.476 34.384" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.82 18.5 23.906 24l4.847 -2.733m4.847 -2.733 -4.847 2.733m0 0 -4.847 7.652m0.058 5.592L23.906 24" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>`
      ) as HTMLButtonElement; // ExpCustom
      this._sectioningButton.addEventListener('click', () => {
        this.sectioningButtonActive = !this.sectioningButtonActive;
      });
      this.domElement.appendChild(this._sectioningButton);
    }

    // ExpCustom - Begin
    if (aConfigWithDefaults.showPmiButton) {
      this._pmiButton = htmlToElement(
        `<button type="button" title="PMI Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg width="24" height="24" viewBox="13.000995635986328 12.999994277954102 21.312999725341797 22.000272750854492" fill="none" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" transform="matrix(6.123233995736766e-17,1,1,-6.123233995736766e-17,0,0)">
        <rect data-background="background" x="0.5" y="0.5" width="47" height="47" rx="7.5" fill="white" stroke="currentColor"></rect>
        <path d="M24.5 17C24.7536 17 25.0026 17.0647 25.2222 17.1876L30.4797 20.0621C30.8005 20.2375 31 20.574 31 20.9395V24.3478V26.8006C30.9997 27.0461 30.9329 27.2873 30.8061 27.4999C30.6793 27.7125 30.4971 27.889 30.2778 28.0118L28.2554 29.1321L27.383 29.6154L26.9468 29.857L26.5106 30.0987L25.2222 30.8124C25.0026 30.9353 24.7536 31 24.5 31C24.2464 31 23.9974 30.9353 23.7778 30.8124L18.7222 28.0118C18.5029 27.889 18.3207 27.7125 18.1939 27.4999C18.0671 27.2873 18.0003 27.0461 18 26.8006V21.1994C18.0003 20.9539 18.0671 20.7127 18.1939 20.5001C18.3207 20.2875 18.5029 20.111 18.7222 19.9882L23.7778 17.1876C23.9974 17.0647 24.2464 17 24.5 17Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        </path>
        <path d="M18.5 20.5L24.6522 24L27.6087 22.2609L30.5652 20.5217" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M24.6875 30.6889L24.6521 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M13 19.4C12.6686 19.4 12.4 19.6686 12.4 20C12.4 20.3314 12.6686 20.6 13 20.6V19.4ZM16 20.6C16.3314 20.6 16.6 20.3314 16.6 20C16.6 19.6686 16.3314 19.4 16 19.4V20.6ZM14.5 28V28.6H15.1V28H14.5ZM13 27.4C12.6686 27.4 12.4 27.6686 12.4 28C12.4 28.3314 12.6686 28.6 13 28.6V27.4ZM16 28.6C16.3314 28.6 16.6 28.3314 16.6 28C16.6 27.6686 16.3314 27.4 16 27.4V28.6ZM13 20.6H14.5V19.4H13V20.6ZM14.5 20.6H16V19.4H14.5V20.6ZM13.9 20V28H15.1V20H13.9ZM14.5 27.4H13V28.6H14.5V27.4ZM13 28.6H16V27.4H13V28.6Z" stroke="currentColor"></path>
        <path d="M35 30.5L32.5 29" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
        <path d="M28.5 34.5L26 33" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
        <path d="M35 18.5L33 19.558" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
        <path d="M28 14.4291L26 15.4871" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
        <path d="M33.5 29.8146L27 33.8146" stroke="currentColor" stroke-width="1.2">
        </path>
        <path d="M34 19L27.5 15" stroke="currentColor" stroke-width="1.2"></path></svg>
        </button>`
      ) as HTMLButtonElement;
      this._pmiButton.addEventListener('click', () => {
        this.pmiButtonActive = !this.pmiButtonActive;
      });
      this.domElement.appendChild(this._pmiButton);
    }

    if (aConfigWithDefaults.showSelectionHandlingButton) {
      this._selectionHandlingButton = htmlToElement(
        `<button type="button" title="Selection Handling Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg width="24" height="24" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_6966_43989)">
            <rect x="4.34082" y="1.8028" width="9.99551" height="9.99551" rx="1.5" stroke="currentColor"/>
            <path d="M1.91064 1.13892V12.4622" stroke="currentColor"/>
            <path d="M2.8208 1.19958L0.999982 1.19958" stroke="currentColor"/>
            <path d="M2.8208 12.4015L0.999982 12.4015" stroke="currentColor"/>
            <path d="M15 14.2285L3.67675 14.2285" stroke="currentColor"/>
            <path d="M14.9395 15.1389L14.9395 13.3181" stroke="currentColor"/>
            <path d="M3.7373 15.1389L3.7373 13.3181" stroke="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_6966_43989">
              <rect width="16" height="16" fill="white" transform="translate(0 0.138916)"/>
            </clipPath>
          </defs>
        </svg>
        </button>`
      ) as HTMLButtonElement;
      this._selectionHandlingButton.addEventListener('click', () => {
        this.selectionHandlingButtonActive = !this.selectionHandlingButtonActive;
      });
      this.domElement.appendChild(this._selectionHandlingButton);
    }

    if (aConfigWithDefaults.showDfmButton) {
      this._dfmButton = htmlToElement(
        `<button type="button" title="DFM Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg width="24px" height="24px" viewBox="0 -1 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="">
          <title>DFM Features</title>
          <desc>DFM Features</desc>
          <defs></defs>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
            <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-152.000000, -204.000000)" fill="#000000">
              <path d="M152.915,221.057 L166.492,227.159 C167.691,227.725 168.209,227.725 169.509,227.159 L183.085,221.057 C183.755,220.744 184,219.275 184,218.484 C183.127,218.921 181.891,219.544 181.867,219.55 L168,225.942 L154.133,219.55 C154.181,219.579 152.906,219.002 152,218.484 C152,219.258 152.194,220.674 152.915,221.057 L152.915,221.057 Z M168,232.335 L154.133,225.942 C154.181,225.972 152.906,225.395 152,224.877 C152,225.65 152.194,227.066 152.915,227.449 L166.492,233.552 C167.691,234.118 168.209,234.118 169.509,233.552 L183.085,227.449 C183.755,227.137 184,225.668 184,224.877 C183.127,225.313 181.891,225.937 181.867,225.942 L168,232.335 L168,232.335 Z M168,205.698 L181.867,213.156 L168,219 L154.133,213.156 L168,205.698 L168,205.698 Z M152.915,214.663 L166.492,220.767 C167.691,221.332 168.209,221.332 169.509,220.767 L183.085,214.663 C184.085,214.197 184.118,212.216 183.085,211.649 L169.509,204.481 C168.442,203.849 167.691,203.882 166.492,204.481 L152.915,211.649 C151.882,212.315 151.849,214.098 152.915,214.663 L152.915,214.663 Z M168,205.698 C168.1,205.815 168.074,205.723 168,205.698 L168,205.698 Z" id="layers" sketch:type="MSShapeGroup"></path>
            </g>
          </g>
        </svg>
        </button>`
      ) as HTMLButtonElement;
      this._dfmButton.addEventListener('click', () => {
        this.dfmButtonActive = !this.dfmButtonActive;
      });
      this.domElement.appendChild(this._dfmButton);
    }

    if (aConfigWithDefaults.showNoteButton) {
      this._noteButton = htmlToElement(
        `<button type="button" title="Note Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1H5v3H2v2h3v3h2V6h3V4H7V1zm12 1h-7v2h7v10h-6v6H5v-9H3v11h12v-2h2v-2h2v-2h2V2h-2zm-2 16h-2v-2h2v2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>       
        </button>`
      ) as HTMLButtonElement;
      this._noteButton.addEventListener('click', () => {
        this.noteButtonActive = !this.noteButtonActive;
      });
      this.domElement.appendChild(this._noteButton);
    }
    // ExpCustom - End

    if (aConfigWithDefaults.showPropertiesButton) {
      this._propertiesButton = htmlToElement(
        `<button type="button" title="Properties" class="viewer-tools__button viewer-tools__structure-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18H17M7 13H17M7 8H14M20 23H4C3.44772 23 3 22.5523 3 22V2C3 1.44772 3.44772 1 4 1H15.6L21 6.5V22C21 22.5523 20.5523 23 20 23Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>`
      ) as HTMLButtonElement;
      this._propertiesButton.addEventListener('click', () => {
        this.propertiesButtonActive = !this.propertiesButtonActive;
      });
      this.domElement.appendChild(this._propertiesButton);
    }

    // ExpCustom - Begin
    if (aConfigWithDefaults.showMeasurementButton) {
      this._measurementButton = htmlToElement(
        `<button type="button" title="Measurement Options" class="viewer-tools__button viewer-tools__structure-button">
        <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 18.518 18.518" xml:space="preserve" width="24" height="24">
        <g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
        <g id="SVGRepo_iconCarrier"><g><g>
        <path d="M0 17.018h4.338V1.499H0v15.519zm0.663 -1.491h0.924v-0.242H0.663v-0.611h0.924v-0.241H0.663v-0.546h0.924v-0.242H0.663v-0.542h1.906v-0.387H0.663v-0.661h0.924v-0.242H0.663v-0.611h0.924v-0.241H0.663v-0.546h0.924v-0.242H0.663v-0.544h1.906v-0.387H0.663v-0.781h0.924v-0.242H0.663v-0.611h0.924v-0.242H0.663v-0.546h0.924v-0.241H0.663v-0.542h1.906v-0.387H0.663v-0.599h1.175v-0.241H0.663v-0.61h1.175V3.96H0.663v-0.546h1.175v-0.241H0.663V2.162h3.012v14.193H0.663v-0.828z"/>
        <path d="M5.525 1.441v15.635h12.993L5.525 1.441zm0.663 14.564H7.112v-0.236H6.188v-0.598H7.112v-0.236H6.188V14.4H7.112v-0.236H6.188v-0.53h1.907v-0.378H6.188v-0.645H7.112v-0.237H6.188v-0.597H7.112v-0.237H6.188v-0.534H7.112v-0.237H6.188v-0.53h1.907v-0.378H6.188v-0.764H7.112v-0.236H6.188v-0.596H7.112v-0.235H6.188V7.496H7.112v-0.236H6.188v-0.531h1.907V6.352H6.188v-0.585h1.175v-0.236H6.188v-0.598h1.175v-0.236H6.188V3.268l10.937 13.161H6.188v-0.423z" />
        <path d="M8.5 9.14v5.37h4.463l-4.463 -5.37zm0.663 1.826 2.406 2.895h-2.406v-2.896z" stroke="currentColor" stroke-width="1.5"/></g></g></g></svg></button>`
      ) as HTMLButtonElement;
      this._measurementButton.addEventListener('click', () => {
        this.measurementButtonActive = !this.measurementButtonActive;
      });
      this.domElement.appendChild(this._measurementButton);
    }
    // ExpCustom - End

    if (aConfigWithDefaults.showScreenshotButton) {
      this._screenshotButton = htmlToElement(
        `<button type="button" title="Take Screenshot" class="viewer-tools__button viewer-tools__screenshot-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5.421" stroke="currentColor" stroke-width="1.8"></circle>
            <path d="M5 1H1.1C1.04477 1 1 1.04477 1 1.1V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M1 19L1 22.9C1 22.9552 1.04477 23 1.1 23L5 23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M 19 23 L 22.9 23 C 22.955 23 23 22.955 23 22.9 L 23 19" stroke-width="1.5" stroke-linecap="round" stroke="currentColor"></path>
            <path d="M 23 5 L 23 1.1 C 23 1.045 22.955 1 22.9 1 L 19 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </button>`
      ) as HTMLButtonElement;

      this._screenshotButton.addEventListener('click', () => {
        this.viewport.grabToImage('screenshot.jpg', 0.95);
      });
      this.domElement.appendChild(this._screenshotButton);
    }
  }

  get structureButtonActive() {
    return this._structureButtonActive;
  }

  set structureButtonActive(theActive) {
    if (this._structureButtonActive !== theActive) {
      this._structureButton?.classList.toggle('viewer-tools__button_active', !this.structureButtonActive);
      this._structureButtonActive = theActive;
      this.dispatchEvent({ type: 'structureButtonActiveChanged' });
    }
  }

  get propertiesButtonActive() {
    return this._propertiesButtonActive;
  }

  set propertiesButtonActive(theActive) {
    if (this._propertiesButtonActive !== theActive) {
      this._propertiesButton?.classList.toggle('viewer-tools__button_active', !this.propertiesButtonActive);
      this._propertiesButtonActive = theActive;
      this.dispatchEvent({ type: 'propertiesButtonActiveChanged' });
    }
  }

  get pmiButtonActive() {
    return this._pmiButtonActive;
  }

  set pmiButtonActive(theActive) {
    if (this._pmiButtonActive !== theActive) {
      this._pmiButton?.classList.toggle('viewer-tools__button_active', !this.pmiButtonActive);
      this._pmiButtonActive = theActive;
      this.dispatchEvent({ type: 'pmiButtonActiveChanged' });
    }
  }

  get selectionHandlingButtonActive() {
    return this._selectionHandlingButtonActive;
  }

  set selectionHandlingButtonActive(theActive) {
    if (this._selectionHandlingButtonActive !== theActive) {
      this._selectionHandlingButton?.classList.toggle('viewer-tools__button_active', !this.selectionHandlingButtonActive);
      this._selectionHandlingButtonActive = theActive;
      this.dispatchEvent({ type: 'selectionHandlingButtonActiveChanged' });
    }
  }

  get dfmButtonActive() {
    return this._dfmButtonActive;
  }

  set dfmButtonActive(theActive) {
    if (this._dfmButtonActive !== theActive) {
      this._dfmButton?.classList.toggle('viewer-tools__button_active', !this.dfmButtonActive);
      this._dfmButtonActive = theActive;
      this.dispatchEvent({ type: 'dfmButtonActiveChanged' });
    }
  }

  get noteButtonActive() {
    return this._noteButtonActive;
  }

  set noteButtonActive(theActive) {
    if (this._noteButtonActive !== theActive) {
      this._noteButton?.classList.toggle('viewer-tools__button_active', !this.noteButtonActive);
      this._noteButtonActive = theActive;
      this.dispatchEvent({ type: 'noteButtonActiveChanged' });
    }
  }

  get measurementButtonActive() {
    return this._measurementButtonActive;
  }

  set measurementButtonActive(theActive) {
    if (this._measurementButtonActive !== theActive) {
      this._measurementButton?.classList.toggle('viewer-tools__button_active', !this.measurementButtonActive);
      this._measurementButtonActive = theActive;
      this.dispatchEvent({ type: 'measurementButtonActiveChanged' });
    }
  }

  get displayMode() {
    return this._displayMode;
  }

  set displayMode(theDisplayMode) {
    if (this._displayMode === theDisplayMode) {
      return;
    }
    this._displayModeButtons[this._displayMode]?.classList.remove('viewer-tools__display-options-menu-item_active');
    this._displayMode = theDisplayMode;
    this._displayModeButtons[this._displayMode]?.classList.add('viewer-tools__display-options-menu-item_active');
    this.dispatchEvent({ type: 'displayModeChanged' });
  }

  get cameraProjectionType() {
    return this._cameraProjectionType;
  }

  set cameraProjectionType(theCameraProjectionType) {
    if (this._cameraProjectionType === theCameraProjectionType) {
      return;
    }
    this._cameraProjectionTypeButtons[this._cameraProjectionType]?.classList.remove('viewer-tools__display-options-menu-item_active');
    this._cameraProjectionType = theCameraProjectionType;
    this._cameraProjectionTypeButtons[this._cameraProjectionType]?.classList.add('viewer-tools__display-options-menu-item_active');
    this.viewport.camera.projectionType = theCameraProjectionType;
    this.dispatchEvent({ type: 'cameraProjectionTypeChanged' });
  }

  get theme() {
    return this._theme;
  }

  set theme(theTheme) {
    if (this._theme === theTheme) {
      return;
    }
    this._themeButtons[this._theme]?.classList.remove('viewer-tools__display-options-menu-item_active');
    this._theme = theTheme;
    this._themeButtons[this._theme]?.classList.add('viewer-tools__display-options-menu-item_active');
    this.dispatchEvent({ type: 'themeChanged' });
  }

  get explodeValuePercentages() {
    return this.viewport.exploder.value * 100;
  }

  set explodeValuePercentages(theValue) {
    if (this._explodeSliderInput) {
      this._explodeSliderInput.value = `${theValue}`;
    }
    if (this._explodeSliderValue) {
      this._explodeSliderValue.textContent = `${theValue}%`;
    }
    this.viewport.exploder.isActive = theValue !== 0;
    this.viewport.exploder.value = theValue / 100;
  }

  get sectioningButtonActive() {
    return this._sectioningButtonActive;
  }

  set sectioningButtonActive(theActive) {
    if (this._sectioningButtonActive !== theActive) {
      this._sectioningButton?.classList.toggle('viewer-tools__button_active', theActive);
      this._sectioningButtonActive = theActive;
      this.dispatchEvent({ type: 'sectioningButtonActiveChanged' });
    }
  }
}
