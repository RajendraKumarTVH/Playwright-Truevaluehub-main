import { PropertiesPanel, PropertiesPanelConfig } from './properties-panel';
import cadex from '@cadexchanger/web-toolkit';
// import { htmlToElement } from './dom';

class SGEPropertiesExtractor extends cadex.ModelData_SceneGraphElementVisitor {
  genericProperties: Record<string, string | number | Date | cadex.ModelData_Point | cadex.ModelData_Box | null | undefined>;
  appearanceProperties: Record<string, string | number | Date | cadex.ModelData_Point | cadex.ModelData_Box | null | undefined> | null;
  customProperties: cadex.ModelData_PropertyTable[];

  constructor() {
    super();
    this.genericProperties = {};
    this.appearanceProperties = null;
    this.customProperties = [];
  }

  override visitAssemblyEnter(theAssembly: cadex.ModelData_Assembly) {
    this.genericProperties['Name'] = theAssembly.name || '<Unnamed Assembly>';
    this.genericProperties['Type'] = 'Assembly';
    if (theAssembly.properties) {
      this.customProperties.push(theAssembly.properties);
    }
    return false;
  }

  override visitAssemblyLeave(_theAssembly: cadex.ModelData_Assembly) {} // NOSONAR

  override visitInstanceEnter(_theInstance: cadex.ModelData_Instance) {
    return true;
  }

  override visitInstanceLeave(theInstance: cadex.ModelData_Instance) {
    if (theInstance.name) {
      this.genericProperties['Name'] = theInstance.name;
    }
    if (!this.appearanceProperties && theInstance.appearance) {
      this._visitAppearance(theInstance.appearance);
    }
    if (theInstance.properties) {
      this.customProperties.push(theInstance.properties);
    }
  }

  override visitPart(thePart: cadex.ModelData_Part) {
    this.genericProperties['Name'] = thePart.name || '<Unnamed Part>';
    this.genericProperties['Type'] = 'Part';
    if (thePart.appearance) {
      this._visitAppearance(thePart.appearance);
    }
    if (thePart.properties) {
      this.customProperties.push(thePart.properties);
    }
  }

  private _visitAppearance(theAppearance: cadex.ModelData_Appearance) {
    const aColor = new cadex.ModelData_ColorObject();
    if (theAppearance.toColor(aColor)) {
      const aColorHex = aColor.getHex().toString(16).padStart(6, '0').toUpperCase();
      this.appearanceProperties = {
        Color: `#${aColorHex} <div class="properties-panel__property-color-box" style="background-color: #${aColorHex}"></div>`,
        Opacity: `${Math.round(aColor.a * 100)}%`,
      };
    }
  }
}

export class MCADPropertiesPanel extends PropertiesPanel {
  private _selectedElements: cadex.ModelData_SceneGraphElement[];

  constructor(theConfig: PropertiesPanelConfig) {
    super(theConfig);

    this._selectedElements = [];
  }

  async clear() {
    this._selectedElements.length = 0;
    await this.update();
  }

  async loadElements(theElements: cadex.ModelData_SceneGraphElement[]) {
    this._selectedElements = theElements;
    if (this.isShown) {
      await this.update();
    }
  }

  protected override async update() {
    this._panelBody.replaceChildren();
    if (this._selectedElements.length === 0) {
      // this._panelBody.appendChild(htmlToElement('<div class="properties-panel__empty-label">Select an element</div>'));//ExpCustom
      return;
    }

    // const anUnits = htmlToElement(
    //   `<div class="properties-panel__units">
    //     <div class="properties-panel__property-name">Units:</div>
    //   </div>`
    // );
    // const anUnitsSelector = htmlToElement(
    //   // Units changing is not supported yet, so select is disabled
    //   `<select title="Units" class="properties-panel__units-selector properties-panel__property-value" disabled>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Millimeters}" selected>Millimeters</option>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Centimeters}">Centimeters</option>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Meters}">Meters</option>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Inches}">Inches</option>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Feets}">Feets</option>
    //     <option value="${cadex.Base_LengthUnit.Base_LU_Yards}">Yards</option>
    //   </select>`) as HTMLSelectElement;
    // anUnits.appendChild(anUnitsSelector);
    // this._panelBody.appendChild(anUnits);

    const aGeneralProperties: Record<string, string | number | Date | cadex.ModelData_Point | cadex.ModelData_Box | null | undefined>[] = [];
    const anAppearanceProperties: Record<string, string | number | Date | cadex.ModelData_Point | cadex.ModelData_Box | null | undefined>[] = [];
    const aCustomProperties: cadex.ModelData_PropertyTable[][] = [];

    for (const anElement of this._selectedElements) {
      const aPropertiesExtractor = new SGEPropertiesExtractor();
      await anElement.accept(aPropertiesExtractor);
      aGeneralProperties.push(aPropertiesExtractor.genericProperties);
      if (aPropertiesExtractor.appearanceProperties) {
        anAppearanceProperties.push(aPropertiesExtractor.appearanceProperties);
      }
      aCustomProperties.push(aPropertiesExtractor.customProperties);
    }

    if (aGeneralProperties.length > 1) {
      const anUniqueNames = Array.from(new Set(aGeneralProperties.map((theProps) => theProps['Name'])));
      const anUniqueTypes = Array.from(new Set(aGeneralProperties.map((theProps) => theProps['Type'])));
      aGeneralProperties[0] = {
        Name: anUniqueNames.length > 1 ? 'n/a' : anUniqueNames[0],
        Type: anUniqueTypes.length > 1 ? 'n/a' : anUniqueTypes[0],
      };
    }

    const aGeneralPropertiesGroup = this.createPropertiesGroup('General', aGeneralProperties[0]);
    this._panelBody.appendChild(aGeneralPropertiesGroup);

    if (aGeneralProperties.length === 1 && anAppearanceProperties.length === 1) {
      const aMaterialPropertiesGroup = this.createPropertiesGroup('Appearance', anAppearanceProperties[0]);
      this._panelBody.appendChild(aMaterialPropertiesGroup);
    }

    if (aCustomProperties.length > 1) {
      const aCommonPropTables: cadex.ModelData_PropertyTable[] = [];
      for (const aPropertyTable of aCustomProperties[0]) {
        if (aCustomProperties.every((theProps) => theProps.includes(aPropertyTable))) {
          aCommonPropTables.push(aPropertyTable);
        }
      }
      aCustomProperties[0] = aCommonPropTables;
    }

    if (aCustomProperties.length > 0) {
      for (const aPropertyTable of aCustomProperties[0]) {
        const aProperties = await aPropertyTable.properties();
        const aMaterialPropertiesGroup = this.createPropertiesGroup(aPropertyTable.name ? `Custom: ${aPropertyTable.name}` : 'Custom', aProperties);
        this._panelBody.appendChild(aMaterialPropertiesGroup);
      }
    }
  }
}
