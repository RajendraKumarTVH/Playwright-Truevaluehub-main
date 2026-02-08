import type {
    PackagingInput,
    PackagingMaterial
} from '../tests/utils/packaging-calculator'

export const CorrugatedBoxList: PackagingMaterial[] = [
    {
        materialMasterId: 1,
        materialTypeName: 'Cardboard Box',
        materialDescription: '102x102x102mm - 32 ECT',
        price: 0.076, // Cost per container from screenshot
        esgImpactCO2Kg: 0.0003, // CO2 from screenshot
        maxWeight: 10 // kg
    },
    {
        materialMasterId: 2,
        materialTypeName: 'Cardboard Box',
        materialDescription: '150x150x150mm - 44 ECT',
        price: 0.12,
        esgImpactCO2Kg: 0.0005,
        maxWeight: 20
    },
    {
        materialMasterId: 3,
        materialTypeName: 'Cardboard Box',
        materialDescription: '200x200x200mm - 48 ECT',
        price: 0.20,
        esgImpactCO2Kg: 0.0008,
        maxWeight: 30
    }
]

export const PalletList: PackagingMaterial[] = [
    {
        materialMasterId: 10,
        materialTypeName: 'Pallets',
        materialDescription: 'Wood - US Std - 1200x1000mm',
        price: 0, // From screenshot
        esgImpactCO2Kg: 0,
        maxWeight: 1000 // kg
    },
    {
        materialMasterId: 11,
        materialTypeName: 'Pallets',
        materialDescription: 'Plastic - EUR - 1200x800mm',
        price: 15.00,
        esgImpactCO2Kg: 2.5,
        maxWeight: 800
    }
]

export const ProtectivePackagingList: PackagingMaterial[] = [
    {
        materialMasterId: 20,
        materialTypeName: 'Protective',
        materialDescription: 'UPSABLE PEANUTS - Starch',
        price: 0.0003, // Cost per unit from screenshot
        esgImpactCO2Kg: 0.0003,
        maxWeight: 0
    },
    {
        materialMasterId: 21,
        materialTypeName: 'Protective',
        materialDescription: 'Bubble Wrap',
        price: 0.0005,
        esgImpactCO2Kg: 0.0004,
        maxWeight: 0
    }
]

// Packaging Scenario 1 - From Screenshot
export const PackagingScenario1: PackagingInput & {
    expected: {
        partsPerShipment: number
        weightPerShipment: number
        volumePerShipment: number
        boxPerShipment: number
        totalPackagingCostPerUnit: number
    }
} = {
    // Part data (from MIG welding test data)
    eav: 950, // Annual volume
    netWeight: 5671.3, // grams (5.6713 kg from screenshot converted)
    dimX: 27, // mm
    dimY: 20, // mm
    dimZ: 5, // mm

    // Delivery
    deliveryFrequency: 365, // Daily delivery assumed, adjust based on actual

    // Selected packaging
    corrugatedBoxId: 1, // 102x102x102mm box
    palletId: 10, // Wood pallet
    shrinkWrap: true,

    // Packaging lists
    corrugatedBoxList: CorrugatedBoxList,
    palletList: PalletList,

    // Labor
    directLaborRate: 2.5582, // From screenshot

    // Expected values (from screenshot)
    expected: {
        partsPerShipment: 13973, // From screenshot
        weightPerShipment: 79.2451, // kg - From screenshot
        volumePerShipment: 0.0377, // m³ - From screenshot
        boxPerShipment: 47, // Secondary packaging quantity
        totalPackagingCostPerUnit: 0.0003 // Cost per unit from screenshot
    }
}

// Additional packaging scenario
export const PackagingScenario2: PackagingInput = {
    eav: 10000,
    netWeight: 1200, // grams
    dimX: 50,
    dimY: 30,
    dimZ: 20,

    deliveryFrequency: 30, // Monthly delivery  

    corrugatedBoxId: 2,
    palletId: 10,
    shrinkWrap: true,

    corrugatedBoxList: CorrugatedBoxList,
    palletList: PalletList,

    directLaborRate: 3.00
}

// High volume packaging scenario
export const PackagingScenario3: PackagingInput = {
    eav: 50000,
    netWeight: 2500,
    dimX: 100,
    dimY: 80,
    dimZ: 50,

    deliveryFrequency: 15, // Bi-weekly delivery

    corrugatedBoxId: 3,
    palletId: 11,
    shrinkWrap: true,

    corrugatedBoxList: CorrugatedBoxList,
    palletList: PalletList,

    directLaborRate: 3.50
}

export default PackagingScenario1
