export interface SearchKeyModel {
  key: string;
  label?: string;
  isDropDown?: boolean;
  isDate?: boolean;
  dropDownValues?: SearchKeyDropDownValue[];
}

export interface SearchKeyDropDownValue {
  id: any;
  name: string;
}
