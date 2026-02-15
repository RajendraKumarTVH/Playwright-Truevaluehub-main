export class SupplierCostStructureTableConfig {
  private static readonly _columnConfig = {
    overheadCategory: {
      displayName: 'Cost Category',
      editable: false,
      width: 30,
    },
    currentValue: {
      displayName: 'Value',
      editable: false,
      width: 10,
    },
    marketComparison: {
      displayName: 'Market Comparison',
      editable: false,
      width: 10,
    },
  };

  private static readonly _displayedColumns: string[] = ['overheadCategory', 'currentValue', 'marketComparison'];

  static getColumnConfig() {
    return this._columnConfig;
  }

  static getDisplayColumns() {
    return this._displayedColumns;
  }
}
