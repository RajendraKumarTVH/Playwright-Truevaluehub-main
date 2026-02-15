export class MachineCostInfoTableConfig {
  private static readonly _columnCofig = {
    edit: {
      displayName: '#',
      width: 3,
    },
    processName: {
      displayName: 'Process Group',
      width: 25,
    },
    manufacturingCategory: {
      displayName: 'Manufacturing Category',
      width: 20,
    },
    machineName: {
      displayName: 'Machine Name',
      width: 25,
    },
    investmentCost: {
      displayName: 'Investment Cost (USD)',
      width: 5,
      editable: true,
    },
    age: {
      displayName: 'Age (Yrs)',
      width: 5,
      editable: true,
    },
    utilization: {
      displayName: 'Maintenance (%)',
      width: 5,
      editable: true,
    },
    suppliesCost: {
      displayName: 'Supplies (%)',
      width: 5,
      editable: true,
    },
    installationFactor: {
      displayName: 'Installation Factor (%)',
      width: 5,
      editable: true,
    },
    marketComparison: {
      displayName: 'MHR Market Comparison',
      editable: false,
      width: 5,
    },
    remove: {
      displayName: '',
      width: 5,
    },
  };
  private static readonly _displayedColumns: string[] = [
    'edit',
    'processName',
    'manufacturingCategory',
    'machineName',
    'investmentCost',
    'age',
    'utilization',
    'suppliesCost',
    'installationFactor',
    'marketComparison',
    'remove',
  ];

  static getColumnConfig() {
    return this._columnCofig;
  }

  static getDisplayColumns() {
    return this._displayedColumns;
  }
}
