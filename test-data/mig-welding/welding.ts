export const WeldingDetails = {
	weld1: {
		weldType: 'Fillet',
		weldSize: 6,
		noOfWeldPasses: 1,
		weldLength: 200,
		weldSide: 'Both' as const,
		weldPlaces: 1,
		grindFlush: 'No' as const,


	},
	weld2: {
		weldType: 'Square',
		weldSize: 8,
		noOfWeldPasses: 1,
		weldLength: 100,
		weldSide: 'Single' as const,
		weldPlaces: 1,
		grindFlush: 'No' as const,


	}
}

export const testWeldData = {
	weld1: {
		weldType: WeldingDetails.weld1.weldType,
		weldSize: WeldingDetails.weld1.weldSize,
		weldLength: WeldingDetails.weld1.weldLength,
		noOfPasses: WeldingDetails.weld1.noOfWeldPasses,
		weldPlaces: WeldingDetails.weld1.weldPlaces
	},
	weld2: {
		weldType: WeldingDetails.weld2.weldType,
		weldSize: WeldingDetails.weld2.weldSize,
		weldLength: WeldingDetails.weld2.weldLength,
		noOfPasses: WeldingDetails.weld2.noOfWeldPasses,
		weldPlaces: WeldingDetails.weld2.weldPlaces
	}
}

export const SubProcessDetails = {
	weld1: {
		weldType: 'Fillet',
		weldPosition: 'Flat',
		travelSpeed: 3.825,
		tackWelds: 1,
		intermediateStops: 2,
		weldCycleTime: 65.2876
	},
	weld2: {
		weldType: 'Square',
		weldPosition: 'Flat',
		travelSpeed: 3.825,
		tackWelds: 1,
		intermediateStops: 1,
		weldCycleTime: 34.1438
	}
} as const
