export const SupplyTerms = {
	supplierName: 'Target Vendor -  United States',
	manufacturingCity: 'New York',
	manufacturingCountry: 'USA',
	deliverySiteName: 'Trinity - Dallas',
	deliveryCity: 'Dallas',
	deliveryCountry: 'USA'
} as const

export const MaterialInformation = {
	processGroup: 'Mig Welding',
	category: 'Ferrous',
	family: 'Carbon Steel',
	descriptionGrade: 'AISI 1050 | DIN CF53 | EN43C | SWRH52B/S50C',
	stockForm: 'Plate',
	scrapPrice: 0.3824,
	materialPrice: 1.306,
	volumePurchased: 0,
	volumeDiscount: 0,
	discountedMaterialPrice: 1.306
} as const

export const MaterialCostDetails = {
	totalWeldLength: 300,
	totalWeldMaterialWeight: 26.9154,
	efficiencyPercent: 70,
	weldBeadWeightWithWastage: 36.5972,
	netMaterialCost: 0
} as const
