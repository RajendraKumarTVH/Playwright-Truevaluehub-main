import { calculatePowerCost, calculateManufacturingCO2 } from '../../tests/utils/welding-calculator'

export const SpecificManufacturingScenario = {
    samplingRate: 5,
    yieldPercentage: 97,
    yieldCostPerPart: 0.0028,
    directLaborRate: 2.5582,
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0551,
    setupLaborRate: 1.8627,
    machineSetupTime: 30,
    setupCostPerPart: 0.0001,
    qaInspectorRate: 1.5845,
    qaInspectionTime: 2,
    qaInspectionCostPerPart: 0,
    machineHourRate: 1.5226,
    cycleTimePerPart: 77.5295,
    machineCostPerPart: 0.0328,
    powerUnitCost: 0.132,
    powerConsumption: 14,
    totalPowerCost: Number(calculatePowerCost(77.5295, 14, 0.132).toFixed(4)),
    co2PerKwHr: 14.9461,
    co2PerPart: Number(calculateManufacturingCO2(77.5295, 14, 14.9461).toFixed(4))
} as const
