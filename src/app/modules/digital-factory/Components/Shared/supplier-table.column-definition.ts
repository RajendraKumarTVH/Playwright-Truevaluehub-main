export class SupplierDirectoryColumnDefinitions {
  static getColumnDefinition() {
    return {
      vendorName: {
        displayName: 'Supplier',
        width: 30,
      },
      missionStatement: {
        displayName: 'Mission Statement',
        width: 70,
      },
      countryName: {
        displayName: 'Mfg Country',
        width: 20,
      },
      regionName: {
        displayName: 'Mfg Region',
        width: 30,
      },
      state: {
        displayName: 'State',
        width: 20,
      },
      companySizeBySales: {
        displayName: 'Company size (Sales)',
        width: 20,
      },
    };
  }
}
