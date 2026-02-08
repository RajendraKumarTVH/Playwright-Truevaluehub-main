export enum StockForm {
	Film,
	Membrane,
	Ingot,
	Sheet,
	CChannel,
	Wax,
	Flat,
	Ore,
	Liquid,
	Foam,
	Bar,
	Pulp,
	Cardboard,
	RectangularBar,
	Section,
	CustomExtrusion,
	Pallet,
	Fiber,
	Billet,
	ExtrusionDrawnForms,
	Cord,
	Wire,
	Granules,
	SquareBillet,
	Rod,
	Sand,
	HexBar,
	Oil,
	Coil,
	Paste,
	Gas,
	Yarn,
	Foil,
	SquareTube,
	Plank,
	Stone,
	Usteel,
	FoamTape,
	Stock,
	Dough,
	Box,
	SeamlessTube,
	RoundBar,
	SquareBar,
	Tube,
	Thread,
	Plate,
	SquarePlate,
	Strip,
	LAngle,
	Paper,
	Roll,
	SquarePipe,
	SerpentinePipe,
	Powder,
	Pipe,
	Chips
}

export class CostingConfig {
	getStockForms() {
		return [
			{ id: StockForm.Film, name: 'Film' },
			{ id: StockForm.Membrane, name: 'Membrane' },
			{ id: StockForm.Ingot, name: 'Ingot' },
			{ id: StockForm.Sheet, name: 'Sheet' },
			{ id: StockForm.CChannel, name: 'C-Channel' },
			{ id: StockForm.Wax, name: 'Wax' },
			{ id: StockForm.Flat, name: 'Flat' },
			{ id: StockForm.Ore, name: 'Ore' },
			{ id: StockForm.Liquid, name: 'Liquid' },
			{ id: StockForm.Foam, name: 'Foam' },
			{ id: StockForm.Bar, name: 'Bar' },
			{ id: StockForm.Pulp, name: 'Pulp' },
			{ id: StockForm.Cardboard, name: 'Cardboard' },
			{ id: StockForm.RectangularBar, name: 'Rectangular bar' },
			{ id: StockForm.Section, name: 'Section' },
			{ id: StockForm.CustomExtrusion, name: 'Custom Extrusion' },
			{ id: StockForm.Pallet, name: 'Pallet' },
			{ id: StockForm.Fiber, name: 'Fiber' },
			{ id: StockForm.Billet, name: 'Billet' },
			{ id: StockForm.ExtrusionDrawnForms, name: 'Extrusion/Drawn Forms' },
			{ id: StockForm.Cord, name: 'Cord' },
			{ id: StockForm.Wire, name: 'Wire' },
			{ id: StockForm.Granules, name: 'Granules' },
			{ id: StockForm.SquareBillet, name: 'Square Billet' },
			{ id: StockForm.Rod, name: 'Rod' },
			{ id: StockForm.Sand, name: 'Sand' },
			{ id: StockForm.HexBar, name: 'Hex Bar' },
			{ id: StockForm.Oil, name: 'Oil' },
			{ id: StockForm.Coil, name: 'Coil' },
			{ id: StockForm.Paste, name: 'Paste' },
			{ id: StockForm.Gas, name: 'Gas' },
			{ id: StockForm.Yarn, name: 'Yarn' },
			{ id: StockForm.Foil, name: 'Foil' },
			{ id: StockForm.SquareTube, name: 'Square Tube' },
			{ id: StockForm.Plank, name: 'Plank' },
			{ id: StockForm.Stone, name: 'Stone' },
			{ id: StockForm.Usteel, name: 'U-steel' },
			{ id: StockForm.FoamTape, name: 'Foam Tape' },
			{ id: StockForm.Stock, name: 'Stock' },
			{ id: StockForm.Dough, name: 'Dough' },
			{ id: StockForm.Box, name: 'Box' },
			{ id: StockForm.SeamlessTube, name: 'Seamless Tube' },
			{ id: StockForm.RoundBar, name: 'Round Bar' },
			{ id: StockForm.SquareBar, name: 'Square Bar' },
			{ id: StockForm.Tube, name: 'Tube' },
			{ id: StockForm.Thread, name: 'Thread' },
			{ id: StockForm.Plate, name: 'Plate' },
			{ id: StockForm.SquarePlate, name: 'Square Plate' },
			{ id: StockForm.Strip, name: 'Strip' },
			{ id: StockForm.LAngle, name: 'L Angle' },
			{ id: StockForm.Paper, name: 'Paper' },
			{ id: StockForm.Roll, name: 'Roll' },
			{ id: StockForm.SquarePipe, name: 'Square Pipe' },
			{ id: StockForm.SerpentinePipe, name: 'Serpentine Pipe' },
			{ id: StockForm.Powder, name: 'Powder' },
			{ id: StockForm.Pipe, name: 'Pipe' },
			{ id: StockForm.Chips, name: 'Chips' }
		]
	}

	getUnitOfMeasure() {
		return [
			{ id: 1, convertionValue: 'mm' },
			{ id: 2, convertionValue: 'inches' },
			{ id: 3, convertionValue: 'cm' },
			{ id: 4, convertionValue: 'm' },
			{ id: 5, convertionValue: 'feet' }
		]
	}

	getBOMColumns() {
		return [
			{
				field: 'partNumber',
				header: 'Part Name',
				mandatory: false,
				width: 200
			},
			{
				field: 'partDescription',
				header: 'Description',
				mandatory: false,
				width: 250
			},
			{
				field: 'partQty',
				header: 'Annual Volume',
				mandatory: true,
				width: 250
			},
			{ field: 'status', header: 'Status', mandatory: false, width: 200 },
			{
				field: 'commodityId',
				header: 'Category',
				mandatory: false,
				width: 200
			},
			{ field: 'vendorId', header: 'Supplier', mandatory: false, width: 200 },
			{ field: 'buId', header: 'Delivery Site', mandatory: false, width: 200 }
		]
	}

	getPartFamilyList() {
		return [
			{ id: 1, name: 'Wire' },
			{ id: 2, name: 'Terminal' },
			{ id: 3, name: 'Connector' },
			{ id: 4, name: 'Tape' },
			{ id: 5, name: 'Clamp' },
			{ id: 6, name: 'Clip/Tie' },
			{ id: 7, name: 'Splice' },
			{ id: 8, name: 'Shrink Tube' },
			{ id: 9, name: 'Tube' },
			{ id: 10, name: 'Seal' },
			{ id: 11, name: 'Grommet' },
			{ id: 12, name: 'Fuse' },
			{ id: 13, name: 'Inline Fuse Holder' },
			{ id: 14, name: 'Adaptor' },
			{ id: 15, name: 'Lable' },
			{ id: 16, name: 'Caps' },
			{ id: 17, name: 'Relay' },
			{ id: 18, name: 'Diode' },
			{ id: 19, name: 'Secondary Locks' },
			{ id: 20, name: 'Sleeves' },
			{ id: 21, name: 'Sprial Wraps' },
			{ id: 22, name: 'Others' }
		]
	}

	setCavityLenght(value: number) {
		if (value === 1) return 1
		if (value > 1 && value <= 2) return 2
		if (value > 2 && value <= 4) return 2
		if (value > 4 && value <= 6) return 3
		if (value > 6 && value <= 8) return 4
		if (value > 8 && value <= 12) return 6
		if (value > 12 && value <= 16) return 4
		if (value > 16 && value <= 32) return 8
		if (value > 32 && value <= 64) return 2
		if (value > 64) return Math.round(value / 2)
		return 1
	}

	cavityColsRows(cavities: number) {
		return (
			[
				{ id: 1, noCavities: 1, columns: 1, rows: 1 },
				{ id: 2, noCavities: 2, columns: 2, rows: 1 },
				{ id: 4, noCavities: 4, columns: 2, rows: 2 },
				{ id: 6, noCavities: 6, columns: 3, rows: 2 },
				{ id: 8, noCavities: 8, columns: 4, rows: 2 },
				{ id: 16, noCavities: 16, columns: 4, rows: 4 },
				{ id: 16, noCavities: 12, columns: 6, rows: 2 },
				{ id: 16, noCavities: 32, columns: 8, rows: 4 },
				{ id: 16, noCavities: 64, columns: 8, rows: 8 }
			].find(x => x.noCavities === cavities) || {
				id: 1,
				noCavities: cavities,
				columns: Math.round(cavities / 2),
				rows: Math.round(cavities / Math.round(cavities / 2))
			}
		)
	}

	typeOfWeld() {
		return [
			{ id: 1, name: 'Fillet Weld' },
			{ id: 2, name: 'Lap Weld' },
			{ id: 3, name: 'Butt Weld (Full Peneteration)' },
			{ id: 4, name: 'Butt Weld (Partial Peneteration)' }
		]
	}

	typeOfWelds() {
		return [
			{ id: 1, name: 'Fillet' },
			{ id: 2, name: 'Square' },
			{ id: 3, name: 'Plug' },
			{ id: 4, name: 'Bevel/Flare/ V Groove' },
			{ id: 5, name: 'U/J Groove' }
		]
	}

	weldPositionList() {
		return [
			{ id: 1, name: 'Flat' },
			{ id: 2, name: 'Horizontal' },
			{ id: 3, name: 'Vertical' },
			{ id: 4, name: 'OverHead' },
			{ id: 5, name: 'Circular' },
			{ id: 6, name: 'Combination' }
		]
	}

	typeOfMaterialBase() {
		return [
			{ id: 1, name: 'Carbon Steel' },
			{ id: 2, name: 'SS 301 to 308' },
			{ id: 3, name: 'SS316' }
		]
	}

	weldingDefaultPercentage(
		processTypeId: number,
		partComplexity = 1,
		percentageType = 'yieldPercentage'
	) {
		return [] // original code incomplete; kept structure same
	}

	weldingPositionList(weldType: 'welding' | 'stickWelding' = 'welding') {
		if (weldType === 'stickWelding') {
			return [
				{
					id: 1,
					name: '1G Manual',
					EffeciencyAuto: 75,
					EffeciencyManual: 75,
					EffeciencySemiAuto: 75
				},
				{
					id: 2,
					name: '2G Manual',
					EffeciencyAuto: 65,
					EffeciencyManual: 65,
					EffeciencySemiAuto: 65
				},
				{
					id: 3,
					name: '3G Manual',
					EffeciencyAuto: 60,
					EffeciencyManual: 60,
					EffeciencySemiAuto: 60
				},
				{
					id: 4,
					name: '4G Manual',
					EffeciencyAuto: 50,
					EffeciencyManual: 50,
					EffeciencySemiAuto: 50
				},
				{
					id: 5,
					name: '1G Robotic',
					EffeciencyAuto: 85,
					EffeciencyManual: 85,
					EffeciencySemiAuto: 85
				},
				{
					id: 6,
					name: '2G Robotic',
					EffeciencyAuto: 75,
					EffeciencyManual: 75,
					EffeciencySemiAuto: 75
				},
				{
					id: 7,
					name: '3G Robotic',
					EffeciencyAuto: 70,
					EffeciencyManual: 70,
					EffeciencySemiAuto: 70
				},
				{
					id: 8,
					name: '4G Robotic',
					EffeciencyAuto: 60,
					EffeciencyManual: 60,
					EffeciencySemiAuto: 60
				}
			]
		}

		return [
			{
				id: 1,
				name: 'Flat',
				EffeciencyAuto: 80,
				EffeciencyManual: 70,
				EffeciencySemiAuto: 80
			},
			{
				id: 2,
				name: 'Horizontal',
				EffeciencyAuto: 80,
				EffeciencyManual: 70,
				EffeciencySemiAuto: 80
			},
			{
				id: 3,
				name: 'Vertical',
				EffeciencyAuto: 75,
				EffeciencyManual: 65,
				EffeciencySemiAuto: 75
			},
			{
				id: 4,
				name: 'OverHead',
				EffeciencyAuto: 75,
				EffeciencyManual: 65,
				EffeciencySemiAuto: 75
			}
		]
	}

	noOfTrackWeld(len: number) {
		return [
			{ toLength: 100, noOfWeld: 2 },
			{ toLength: 250, noOfWeld: 3 },
			{ toLength: 500, noOfWeld: 4 },
			{ toLength: 1000, noOfWeld: 8 },
			{ toLength: 1500, noOfWeld: 12 },
			{ toLength: 2000, noOfWeld: 16 },
			{ toLength: 2500, noOfWeld: 20 },
			{ toLength: 3000, noOfWeld: 24 },
			{ toLength: 3500, noOfWeld: 30 },
			{ toLength: 4000, noOfWeld: 34 },
			{ toLength: 4500, noOfWeld: 38 },
			{ toLength: 5000, noOfWeld: 44 },
			{ toLength: 5500, noOfWeld: 50 },
			{ toLength: 6000, noOfWeld: 54 },
			{ toLength: 6500, noOfWeld: 58 },
			{ toLength: 7000, noOfWeld: 62 },
			{ toLength: 7500, noOfWeld: 68 },
			{ toLength: 8000, noOfWeld: 72 },
			{ toLength: 8500, noOfWeld: 76 },
			{ toLength: 9000, noOfWeld: 80 },
			{ toLength: 1000000, noOfWeld: 85 }
		]
	}

	weldPass(
		len: number,
		weldType: 'welding' | 'stickWelding' = 'welding'
	): number {
		let weldList: { toWeldLegLength: number; noOfWeldPasses: number }[] = []

		if (weldType === 'stickWelding') {
			weldList = [
				{ toWeldLegLength: 3, noOfWeldPasses: 1 },
				{ toWeldLegLength: 6, noOfWeldPasses: 2 },
				{ toWeldLegLength: 10000, noOfWeldPasses: 3 }
			]
		} else {
			weldList = [
				{ toWeldLegLength: 8, noOfWeldPasses: 1 },
				{ toWeldLegLength: 12, noOfWeldPasses: 2 },
				{ toWeldLegLength: 10000, noOfWeldPasses: 0 }
			]
		}

		const result = weldList.find(item => len <= item.toWeldLegLength)
		return result ? result.noOfWeldPasses : 0
	}

	weldingValuesForStickWelding() {
		return [
			{
				id: 1,
				ToPartThickness: 3.175,
				WireDiameter: 1.6,
				Current: 33,
				Voltage: 22.5,
				TravelSpeed: 1.25
			},
			{
				id: 2,
				ToPartThickness: 4.7625,
				WireDiameter: 2.4,
				Current: 83,
				Voltage: 23.5,
				TravelSpeed: 1.5
			},
			{
				id: 3,
				ToPartThickness: 6.35,
				WireDiameter: 3.2,
				Current: 120,
				Voltage: 23.5,
				TravelSpeed: 1.67
			},
			{
				id: 4,
				ToPartThickness: 8,
				WireDiameter: 4,
				Current: 165,
				Voltage: 24,
				TravelSpeed: 1.88
			},
			{
				id: 5,
				ToPartThickness: 9.525,
				WireDiameter: 4.8,
				Current: 208,
				Voltage: 25.5,
				TravelSpeed: 2
			},
			{
				id: 6,
				ToPartThickness: 12.7,
				WireDiameter: 6.4,
				Current: 313,
				Voltage: 26.5,
				TravelSpeed: 2.17
			},
			{
				id: 7,
				ToPartThickness: 10000,
				WireDiameter: 8,
				Current: 400,
				Voltage: 28,
				TravelSpeed: 2.5
			}
		]
	}

	weldingMachineValuesForSeamWelding() {
		return [
			{ id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
			{ id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
			{ id: 3, machine: 'FN-160-H', weldingEfficiency: 31 }
		]
	}
}
