export class DfmFeaturesLib {
  caller = null;

  private gdt = [
    { id: 1, gdtText: 'Gd&T-Straightness' },
    { id: 2, gdtText: 'Gd&T-Flatness' },
    { id: 3, gdtText: 'Gd&T-Roundness' },
    { id: 4, gdtText: 'Gd&T-Cylindricity' },
    { id: 5, gdtText: 'Gd&T-Runout' },
    { id: 6, gdtText: 'Gd&T-Total Runout' },
    { id: 7, gdtText: 'Gd&T-Profile of Line' },
    { id: 8, gdtText: 'Gd&T-Profile of Surface' },
    { id: 9, gdtText: 'Gd&T-Angularity' },
    { id: 10, gdtText: 'Gd&T-Perpendicularity' },
    { id: 11, gdtText: 'Gd&T-Parallelism' },
    { id: 12, gdtText: 'Gd&T-Position' },
    { id: 13, gdtText: 'Gd&T-Concentricity' },
    { id: 14, gdtText: 'Gd&T-Symmetry' },
  ];

  constructor(caller) {
    this.caller = caller;
  }

  getIconButtonSvg(iconId: string) {
    const datumIcon = document.createElement('button');
    datumIcon.id = iconId;
    datumIcon.classList.add('viewer-tools__button', 'viewer-tools__structure-button');
    datumIcon.title = 'Show Datum';
    datumIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.5"/>
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="1.5"/>
      <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `;
    datumIcon.addEventListener('click', () => this.caller.activeModal.close({ reopen: true, caller: 'manufacturing' }));
    return datumIcon;
  }

  getApplyButton(buttonId = 'apply-features', setIndex = -1) {
    const aFeatureProceedButton = document.createElement('button');
    aFeatureProceedButton.id = buttonId;

    aFeatureProceedButton.classList.add('submit-button');
    aFeatureProceedButton.classList.add('apply-button');
    if (buttonId === 'apply-features') {
      aFeatureProceedButton.textContent = 'Apply Features';
      aFeatureProceedButton.addEventListener('click', () => this.applyFeatures(setIndex));
    } else if (buttonId === 'update-model') {
      aFeatureProceedButton.textContent = 'Update Datum';
      aFeatureProceedButton.classList.add('update-button');
      aFeatureProceedButton.addEventListener('click', this.caller.changeDatum.bind(this));
      aFeatureProceedButton.style.display = 'none';
      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('update-button-div');
      wrapperDiv.appendChild(aFeatureProceedButton);
      return wrapperDiv;
    } else if (buttonId === 'apply-feature-set') {
      aFeatureProceedButton.textContent = 'Apply Feature Set';
      aFeatureProceedButton.setAttribute('param-set', setIndex.toString());
      aFeatureProceedButton.addEventListener('click', () => this.applyFeatures(setIndex));
      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('apply-feature-set-button-div');
      wrapperDiv.appendChild(aFeatureProceedButton);
      return wrapperDiv;
    }
    return aFeatureProceedButton;
  }

  getFeatureCheckbox(fName, aParameters, currentFeatureId, disabled, checked, setIndex = -1, numbering = '') {
    const featureCheckbox = document.createElement('input');
    featureCheckbox.type = 'checkbox';
    featureCheckbox.name = 'feature-checkbox';
    featureCheckbox.value = `${numbering} -> ${fName} -> ${aParameters} -> ${currentFeatureId}`;
    featureCheckbox.disabled = disabled;
    featureCheckbox.checked = checked;
    featureCheckbox.setAttribute('param-set', setIndex.toString());
    featureCheckbox.classList.add('feature-checkbox');

    const label = document.createElement('label');
    label.appendChild(featureCheckbox);
    label.appendChild(document.createTextNode(numbering + ' ' + aParameters));
    return label;
  }

  getFeatureToleranceFields(labelText, textboxName, index, inputType = 'text', textboxValue = '') {
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('feature-input-container');

    const label = document.createElement('label');
    label.textContent = labelText;
    label.classList.add('feature-input-label');
    containerDiv.appendChild(label);

    const textbox = document.createElement('input');
    textbox.type = inputType;
    textbox.id = `${textboxName}-${index}`;
    textbox.name = `${textboxName}-${index}`;
    textbox.value = textboxValue;
    textbox.classList.add('feature-input-textbox');
    containerDiv.appendChild(textbox);

    return containerDiv;
  }

  getFeatureGdtFields(selectName, textboxName, index, inputType = 'text', selectValue = 1, textboxValue = '') {
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('feature-input-container');

    const select = document.createElement('select');
    select.id = `${selectName}-${index}`;
    select.name = `${selectName}-${index}`;
    select.classList.add('feature-input-select');

    this.gdt.forEach((optionData) => {
      const option = document.createElement('option');
      option.value = optionData.id.toString();
      option.textContent = optionData.gdtText;
      if (optionData.id === selectValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    containerDiv.appendChild(select);

    const textbox = document.createElement('input');
    textbox.type = inputType;
    textbox.id = `${textboxName}-${index}`;
    textbox.name = `${textboxName}-${index}`;
    textbox.value = textboxValue;
    textbox.classList.add('feature-input-textbox');
    containerDiv.appendChild(textbox);

    return containerDiv;
  }

  getControlValue(textboxName, index) {
    return (document.getElementById(`${textboxName}-${index}`) as HTMLInputElement).value;
  }

  applyFeatures(setIndex = -1) {
    // Expcustom - feature selection
    // const data = Array.from(document.querySelectorAll(`input[name="feature-checkbox"]:checked:not(:disabled)`)).map(checkbox => checkbox['value']);
    let data = Array.from(document.querySelectorAll(`input[name="feature-checkbox"]:checked`)).map((checkbox) => ({ value: checkbox['value'], disabled: checkbox['disabled'] }));
    if (setIndex >= 0) {
      data = Array.from(document.querySelectorAll(`input[name="feature-checkbox"][param-set="${setIndex}"]`)).map((checkbox) => ({ value: checkbox['value'], disabled: checkbox['disabled'] }));
    }
    // const data = Array.from(document.querySelectorAll(`input[name="feature-checkbox"]`)).map(checkbox => ({ value: checkbox['value'], checked: checkbox['checked'], disabled: checkbox['disabled'] }));
    const featureData = [];
    data?.forEach((theFeature) => {
      const theFeatureParams = theFeature?.value?.split(' -> ');
      const featureDataEntry = { name: theFeatureParams[1] };
      let paramsString = theFeatureParams[2];
      paramsString = paramsString.replace(/\([^)]*\)/g, (match) => match.replace(/, /g, '###'));
      paramsString.split(', ').forEach((theParameter) => {
        const cleanedParameter = theParameter.replace(/###/g, ', ');
        let [name, value] = cleanedParameter?.replace(' mm', '')?.split(' - ');
        name = name.toLowerCase();
        if (['axis', 'centroid'].includes(name)) {
          featureDataEntry[name] = this.caller._sharedService.parseVector(value);
        } else {
          featureDataEntry[name] = +value;
        }
      });
      // featureDataEntry['checked'] = !!theFeature['checked'];
      featureDataEntry['disabled'] = theFeature['disabled'];
      featureDataEntry['id'] = theFeatureParams[3].toString();
      featureDataEntry['setIndex'] = setIndex;
      featureDataEntry['serialNo'] = theFeatureParams[0];
      featureDataEntry['dimTolerance'] = +this.getControlValue('dimTolerance', featureDataEntry['id']);
      featureDataEntry['gdtSelect'] = +this.getControlValue('gdtSelect', featureDataEntry['id']);
      featureDataEntry['gdtVal'] = +this.getControlValue('gdtVal', featureDataEntry['id']);
      featureDataEntry['surfaceFinish'] = +this.getControlValue('surfaceFinish', featureDataEntry['id']);
      featureData.push(featureDataEntry);
    });
    console.log(data);
    console.log(featureData);
    this.caller.activeModal.close({ featureData: featureData });
  }
}
