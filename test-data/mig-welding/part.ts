import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining
} from '../../tests/utils/welding-calculator'

const annualVolumeQty = 950
const productLifeRemaining = 5

export const PartInformation = {
	internalPartNumber: '1023729-C-1023729-C 3',
	drawingNumber: 'Enter Drawing value',
	revisionNumber: 'Enter Revision value',
	partDescription: 'Enter Part Description',
	manufacturingCategory: 'Assembly',
	bomQty: 1,
	annualVolumeQty,
	lotSize: 79,
	productLifeRemaining,
	lifeTimeQtyRemaining: 4750
}

export const PartDetails = {
	partEnvelopeLength: 27,
	partEnvelopeWidth: 20,
	partEnvelopeHeight: 5,
	netWeight: 5.6713,
	partSurfaceArea: 1166.6708,
	partVolume: 720.6173
} as const
