// src/app/modules/costing/config/MachiningData.ts

export const MachiningAllowanceData = [
	{
		start: 0,
		end: 20,
		machineAllowance: 2,
		taperAllowance: 0.5,
		bladeAllowance: 2,
		barLengthMachineAllowance: 1,
		lengthAllowance: 3.5
	},
	{
		start: 21,
		end: 40,
		machineAllowance: 3,
		taperAllowance: 0.8,
		bladeAllowance: 2,
		barLengthMachineAllowance: 1,
		lengthAllowance: 3.8
	},
	{
		start: 41,
		end: 65,
		machineAllowance: 4,
		taperAllowance: 1,
		bladeAllowance: 2,
		barLengthMachineAllowance: 1,
		lengthAllowance: 4
	},
	{
		start: 66,
		end: 100,
		machineAllowance: 5,
		taperAllowance: 1.5,
		bladeAllowance: 2.5,
		barLengthMachineAllowance: 2,
		lengthAllowance: 6
	},
	{
		start: 101,
		end: 150,
		machineAllowance: 8,
		taperAllowance: 3,
		bladeAllowance: 3,
		barLengthMachineAllowance: 3,
		lengthAllowance: 9
	},
	{
		start: 151,
		end: 300,
		machineAllowance: 12,
		taperAllowance: 6,
		bladeAllowance: 3.5,
		barLengthMachineAllowance: 3,
		lengthAllowance: 12.5
	}
]

export const StockLenDiaRanges = [
	{ max: 20, addDiameter: 2, addLength: 3.5 },
	{ max: 40, addDiameter: 3, addLength: 3.8 },
	{ max: 65, addDiameter: 4, addLength: 4.0 },
	{ max: 100, addDiameter: 5, addLength: 6.0 },
	{ max: 150, addDiameter: 8, addLength: 9.0 },
	{ max: Number.MAX_VALUE, addDiameter: 12, addLength: 12.5 }
]

export const StockValueTable = [
	{ max: 200, stockLength: 4, stockWidth: 4, stockHeight: 5 },
	{ max: 400, stockLength: 6, stockWidth: 6, stockHeight: 5 },
	{ max: 600, stockLength: 8, stockWidth: 8, stockHeight: 6 },
	{ max: Number.MAX_VALUE, stockLength: 10, stockWidth: 10, stockHeight: 8 }
]
