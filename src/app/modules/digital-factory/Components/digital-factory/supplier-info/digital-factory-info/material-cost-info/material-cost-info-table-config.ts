export class MaterialCostInfoTableConfig {
  private static readonly _columnCofig = {
    edit: {
      displayName: '#',
      width: 5,
    },
    materialGroup: {
      displayName: 'Material Category',
      width: 20,
    },
    materialType: {
      displayName: 'Family',
      width: 20,
    },
    materialDescription: {
      displayName: 'Material Name',
      width: 30,
    },
    volumePurchased: {
      displayName: 'Purchased Volume (MT)',
      editable: true,
      width: 5,
    },
    discountPercent: {
      displayName: 'Volume Discount (%)',
      editable: true,
      width: 5,
    },
    price: {
      displayName: 'Material Price ($/Kg)',
      editable: true,
      width: 5,
    },
    scrapPrice: {
      displayName: 'Scrap Price ($/kg)',
      editable: true,
      width: 5,
    },
    marketComparison: {
      displayName: 'Market Comparison',
      editable: false,
      width: 20,
    },
    countryOfOriginName: {
      displayName: 'Country Of Origin',
      width: 20,
    },
    remove: {
      displayName: 'Action',
      width: 5,
    },
  };
  private static readonly _displayedColumns: string[] = [
    'edit',
    'materialGroup',
    'materialType',
    'materialDescription',
    'countryOfOriginName',
    'volumePurchased',
    'price',
    'scrapPrice',
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
