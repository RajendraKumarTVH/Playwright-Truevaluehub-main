import { Injectable } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { SharedService } from 'src/app/modules/costing/services/shared.service'
import { MaterialInfoDto } from '../models'
import { MachiningTypes } from 'src/app/modules/costing/costing.config'
// Import data from the new class
import {
	MachiningAllowanceData,
	StockLenDiaRanges,
	StockValueTable
} from './config/MachiningData' // Adjust path

@Injectable({
	providedIn: 'root'
})
export class MaterialMachiningConfigService {
	public machiningFlags = {
		isRod: false,
		isTube: false,
		isSquareBar: false,
		isRectangularBar: false,
		isHexagonalBar: false,
		isBlock: false,
		isWire: false,
		isOtherShapes: false,
		isLAngle: false,
		isIBeam: false,
		isChannel: false,
		isWBeams: false,
		isHss: false
	}

	constructor(
		private formbuilder: FormBuilder,
		public sharedService: SharedService
	) {}

	getMachiningFlags(processValueId: number) {
		// Logic remains the same
		return {
			isRod: processValueId === MachiningTypes.Rod ? true : false,
			isTube: processValueId === MachiningTypes.Tube ? true : false,
			isSquareBar: processValueId === MachiningTypes.SquareBar ? true : false,
			isRectangularBar:
				processValueId === MachiningTypes.RectangularBar ? true : false,
			isHexagonalBar:
				processValueId === MachiningTypes.HexagonalBar ? true : false,
			isBlock: processValueId === MachiningTypes.Block ? true : false,
			isWire: processValueId === MachiningTypes.Wire ? true : false,
			isOtherShapes:
				processValueId === MachiningTypes.OtherShapes ? true : false,
			isLAngle: processValueId === MachiningTypes.LAngle ? true : false,
			isIBeam: processValueId === MachiningTypes.IBeam ? true : false,
			isChannel: processValueId === MachiningTypes.Channel ? true : false,
			isWBeams: processValueId === MachiningTypes.WBeams ? true : false,
			isHss: processValueId === MachiningTypes.HSS ? true : false
		}
	}

	getMachiningAllowance() {
		// Data retrieved from the imported constant
		return MachiningAllowanceData
	} // ... getFormFields, formFieldsReset, formPatch, setCalculationObject, formPatchResults, setPayload methods remain the same ...

	getFormFields(materialInfoList, conversionValue, isEnableUnitConversion) {
		// ... logic remains the same ...
		return {
			partOuterDiameter: [0],
			// ...
			maxWallthick: [
				materialInfoList?.length > 0
					? this.sharedService.convertUomInUI(
							this.sharedService.isValidNumber(
								materialInfoList[0].wallThickessMm
							),
							conversionValue,
							isEnableUnitConversion
					  )
					: 0,
				[Validators.required]
			]
			// ...
		}
	}

	// ... other form/patch methods remain the same ...

	machiningDefaults(extractedMaterialData) {
		const dimX = extractedMaterialData.DimX
		const dimY = extractedMaterialData.DimY
		const dimZ = extractedMaterialData.DimZ // const partMinDiameter = extractedMaterialData.PartInnerDiameter;
		const partMaxDiameter = extractedMaterialData.PartOuterDiameter
		const partLength = extractedMaterialData.PartLength

		const isPartCircular = dimX == dimY || dimZ == dimY || dimX == dimZ
		let stockLength = 0
		let stockHeight = 0
		let stockWidth = 0
		const stockDiameter =
			partMaxDiameter + this.getStockLenDia(partMaxDiameter)?.addDiameter || 0

		if (isPartCircular) {
			stockLength =
				partLength + this.getStockLenDia(partMaxDiameter)?.addLength || 0
		} else {
			stockLength = dimX + this.getStockValue(dimX)?.stockLength || 0
			stockWidth = dimY + this.getStockValue(dimY)?.stockWidth || 0
			stockHeight = dimZ + this.getStockValue(dimZ)?.stockHeight || 0
		}

		return {
			stockDiameter,
			stockLength,
			stockWidth,
			stockHeight
		}
	}

	getStockLenDia(dimension) {
		// Logic references the imported constant
		return StockLenDiaRanges.find(r => dimension <= r.max)
	}

	getStockValue(dimension) {
		// Logic references the imported constant
		return StockValueTable.find(x => dimension <= x.max)
	}
}
