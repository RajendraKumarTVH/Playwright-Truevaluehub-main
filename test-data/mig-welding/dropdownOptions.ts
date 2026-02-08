export const DropdownOptions = {
	weldTypes: [
		'Fillet',
		'Square',
		'Plug',
		'Bevel/Flare/ V Groove',
		'U/J Groove'
	] as const,
	weldSides: ['Single', 'Both'] as const,
	weldPositions: [
		'Flat',
		'Horizontal',
		'Vertical',
		'OverHead',
		'Combination'
	] as const,
	grindFlush: ['No', 'Yes'] as const,
	machineAutomation: ['Automatic', 'Semi-Auto', 'Manual'] as const,
	samplingPlan: ['Level1', 'Level2', 'Level3'] as const,
	manufacturingCategories: [
		'Sheet Metal and Fabrication',
		'Plastic Injection Moulding',
		'Stock Machining',
		'Casting and Machining',
		'Forging and Machining'
	] as const
}
