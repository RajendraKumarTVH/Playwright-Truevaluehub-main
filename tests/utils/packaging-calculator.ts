/**
 * Packaging Calculator
 * TypeScript implementation based on Angular service calculations
 * Source: costing-packaging-information-calculator.service.ts
 */

export enum MaterialTypeEnum {
    Box = 'Box',
    Pallet = 'Pallet',
    Protective = 'Protective'
}

export interface PackagingMaterial {
    materialMasterId: number
    materialTypeName: string
    materialDescription: string
    price: number
    esgImpactCO2Kg: number
    maxWeight?: number
    maxVolume?: number
}

export interface PackagingInput {
    // Part data
    eav: number // Annual volume
    netWeight: number // grams
    dimX: number // mm
    dimY: number // mm
    dimZ: number // mm

    // Delivery
    deliveryFrequency: number // days

    // Selected packaging
    corrugatedBoxId: number
    palletId: number
    shrinkWrap: boolean

    // Packaging lists
    corrugatedBoxList: PackagingMaterial[]
    palletList: PackagingMaterial[]

    // Labor
    directLaborRate: number // $/hr
}

export interface PackagingOutput {
    // Shipment calculations
    partsPerShipment: number
    weightPerShipment: number // kg
    volumePerShipment: number // m³

    // Packaging quantities
    boxPerShipment: number
    palletPerShipment: number

    // Costs
    corrugatedBoxCostPerUnit: number
    totalBoxCostPerShipment: number
    palletCostPerUnit: number
    totalPalletCostPerShipment: number
    shrinkWrapCostPerUnit: number
    totalShrinkWrapCost: number
    totalPackagingCostPerShipment: number
    totalPackagingCostPerUnit: number

    // ESG
    esgImpactPerBox: number
    esgImpactPerPallet: number
    totalESGImpactPerPart: number

    // Density
    shipmentDensity: number
}

// Constants
export const ShrinkWrapCost = 0.5 // $ per unit

/**
 * Calculate shipment density
 * @param weightPerShipment Weight in kg
 * @param volumePerShipment Volume in m³
 * @returns Density in kg/m³
 */
export function calculateShipmentDensity(
    weightPerShipment: number,
    volumePerShipment: number
): number {
    if (volumePerShipment === 0) return 0
    return weightPerShipment / volumePerShipment
}

/**
 * Calculate parts per shipment based on delivery frequency
 * @param annualVolume Annual volume
 * @param deliveryFrequency Delivery frequency in days
 * @returns Parts per shipment
 */
export function calculatePartsPerShipment(
    annualVolume: number,
    deliveryFrequency: number
): number {
    return Math.round(annualVolume * (deliveryFrequency / 365))
}

/**
 * Calculate weight per shipment
 * @param partsPerShipment Parts per shipment
 * @param netWeight Net weight in grams
 * @returns Weight in kg
 */
export function calculateWeightPerShipment(
    partsPerShipment: number,
    netWeight: number
): number {
    return Number(((partsPerShipment * netWeight) / 1000).toFixed(4))
}

/**
 * Calculate volume per shipment
 * @param partsPerShipment Parts per shipment
 * @param dimX Dimension X in mm
 * @param dimY Dimension Y in mm
 * @param dimZ Dimension Z in mm
 * @returns Volume in m³
 */
export function calculateVolumePerShipment(
    partsPerShipment: number,
    dimX: number,
    dimY: number,
    dimZ: number
): number {
    return Number(((partsPerShipment * dimX * dimY * dimZ) / 1000000000).toFixed(4))
}

/**
 * Parse packaging dimensions from description
 * @param description Description like "102x102x102mm"
 * @returns {length, width, height} in mm
 */
export function parsePackagingDimensions(description: string): {
    length: number
    width: number
    height: number
} {
    const parts = description.split('x')
    if (parts.length >= 3) {
        return {
            length: parseFloat(parts[0].trim()) || 0,
            width: parseFloat(parts[1].trim()) || 0,
            height: parseFloat(parts[2].trim()) || 0
        }
    }
    return { length: 0, width: 0, height: 0 }
}

/**
 * Calculate boxes or pallets needed per shipment
 * @param weightPerShipment Weight in kg
 * @param volumePerShipment Volume in m³
 * @param packageDimensions Package dimensions in mm
 * @param maxWeight Max weight capacity in kg
 * @returns Number of packages needed
 */
export function calculatePackagesNeeded(
    weightPerShipment: number,
    volumePerShipment: number,
    packageDimensions: { length: number; width: number; height: number },
    maxWeight: number
): number {
    const { length, width, height } = packageDimensions
    const packageVolume = (length * width * height) / 1000000000 // Convert mm³ to m³

    if (packageVolume === 0) return 0

    const maxDensity = maxWeight / (packageVolume * 0.8)
    const shipmentDensity = calculateShipmentDensity(
        weightPerShipment,
        volumePerShipment
    )

    let packagesNeeded: number

    if (shipmentDensity > maxDensity) {
        // Weight-limited
        packagesNeeded = Math.ceil(weightPerShipment / maxWeight)
    } else {
        // Volume-limited
        packagesNeeded = Math.ceil(volumePerShipment / packageVolume)
    }

    return packagesNeeded
}

/**
 * Calculate total box cost per shipment
 * @param boxPerShipment Boxes per shipment
 * @param boxCostPerUnit Cost per box
 * @returns Total box cost
 */
export function calculateTotalBoxCost(
    boxPerShipment: number,
    boxCostPerUnit: number
): number {
    return Number((boxPerShipment * boxCostPerUnit).toFixed(4))
}

/**
 * Calculate total pallet cost per shipment
 * @param palletPerShipment Pallets per shipment
 * @param palletCostPerUnit Cost per pallet
 * @returns Total pallet cost
 */
export function calculateTotalPalletCost(
    palletPerShipment: number,
    palletCostPerUnit: number
): number {
    return Number((palletPerShipment * palletCostPerUnit).toFixed(4))
}

/**
 * Calculate shrink wrap cost
 * @param shrinkWrap Whether shrink wrap is used
 * @param palletPerShipment Pallets per shipment
 * @param shrinkWrapCostPerUnit Cost per shrink wrap unit
 * @returns Total shrink wrap cost
 */
export function calculateShrinkWrapCost(
    shrinkWrap: boolean,
    palletPerShipment: number,
    shrinkWrapCostPerUnit: number = ShrinkWrapCost
): number {
    if (!shrinkWrap) return 0
    return Number((shrinkWrapCostPerUnit * palletPerShipment).toFixed(4))
}

/**
 * Calculate total packaging cost per shipment
 * @param totalBoxCost Total box cost
 * @param totalPalletCost Total pallet cost
 * @param totalShrinkWrapCost Total shrink wrap cost
 * @param additionalProtectiveCost Additional protective packaging cost
 * @returns Total packaging cost per shipment
 */
export function calculateTotalPackagingCost(
    totalBoxCost: number,
    totalPalletCost: number,
    totalShrinkWrapCost: number,
    additionalProtectiveCost: number = 0
): number {
    return Number(
        (
            totalBoxCost +
            totalPalletCost +
            totalShrinkWrapCost +
            additionalProtectiveCost
        ).toFixed(4)
    )
}

/**
 * Calculate packaging cost per unit
 * @param totalPackagingCost Total packaging cost per shipment  
 * @param partsPerShipment Parts per shipment
 * @returns Cost per unit
 */
export function calculatePackagingCostPerUnit(
    totalPackagingCost: number,
    partsPerShipment: number
): number {
    if (partsPerShipment === 0) return 0
    return Number((totalPackagingCost / partsPerShipment).toFixed(4))
}

/**
 * Calculate total ESG impact per part
 * @param boxPerShipment Boxes per shipment
 * @param palletPerShipment Pallets per shipment
 * @param partsPerShipment Parts per shipment
 * @param esgPerBox ESG impact per box (kg CO2)
 * @param esgPerPallet ESG impact per pallet (kg CO2)
 * @returns Total ESG impact per part (kg CO2)
 */
export function calculateTotalESGImpact(
    boxPerShipment: number,
    palletPerShipment: number,
    partsPerShipment: number,
    esgPerBox: number,
    esgPerPallet: number
): number {
    if (partsPerShipment === 0) return 0
    return Number(
        (
            (esgPerBox * boxPerShipment + esgPerPallet * palletPerShipment) /
            partsPerShipment
        ).toFixed(4)
    )
}

/**
 * Calculate complete packaging information
 * @param input Packaging input parameters
 * @returns Complete packaging calculations
 */
export function calculatePackaging(input: PackagingInput): PackagingOutput {
    // Calculate parts per shipment
    const partsPerShipment = calculatePartsPerShipment(
        input.eav,
        input.deliveryFrequency
    )

    // Calculate weight and volume
    const weightPerShipment = calculateWeightPerShipment(
        partsPerShipment,
        input.netWeight
    )
    const volumePerShipment = calculateVolumePerShipment(
        partsPerShipment,
        input.dimX,
        input.dimY,
        input.dimZ
    )

    // Get selected packaging materials
    const selectedBox = input.corrugatedBoxList.find(
        (b) => b.materialMasterId === input.corrugatedBoxId
    )
    const selectedPallet = input.palletList.find(
        (p) => p.materialMasterId === input.palletId
    )

    // Parse dimensions
    const boxDimensions = parsePackagingDimensions(
        selectedBox?.materialDescription || ''
    )
    const palletDimensions = parsePackagingDimensions(
        selectedPallet?.materialDescription || ''
    )

    // Calculate quantities needed
    const boxPerShipment = calculatePackagesNeeded(
        weightPerShipment,
        volumePerShipment,
        boxDimensions,
        selectedBox?.maxWeight || 0
    )
    const palletPerShipment = calculatePackagesNeeded(
        weightPerShipment,
        volumePerShipment,
        palletDimensions,
        selectedPallet?.maxWeight || 0
    )

    // Calculate costs
    const corrugatedBoxCostPerUnit = selectedBox?.price || 0
    const palletCostPerUnit = selectedPallet?.price || 0

    const totalBoxCostPerShipment = calculateTotalBoxCost(
        boxPerShipment,
        corrugatedBoxCostPerUnit
    )
    const totalPalletCostPerShipment = calculateTotalPalletCost(
        palletPerShipment,
        palletCostPerUnit
    )
    const totalShrinkWrapCost = calculateShrinkWrapCost(
        input.shrinkWrap,
        palletPerShipment
    )

    const totalPackagingCostPerShipment = calculateTotalPackagingCost(
        totalBoxCostPerShipment,
        totalPalletCostPerShipment,
        totalShrinkWrapCost
    )
    const totalPackagingCostPerUnit = calculatePackagingCostPerUnit(
        totalPackagingCostPerShipment,
        partsPerShipment
    )

    // Calculate ESG
    const esgImpactPerBox = selectedBox?.esgImpactCO2Kg || 0
    const esgImpactPerPallet = selectedPallet?.esgImpactCO2Kg || 0
    const totalESGImpactPerPart = calculateTotalESGImpact(
        boxPerShipment,
        palletPerShipment,
        partsPerShipment,
        esgImpactPerBox,
        esgImpactPerPallet
    )

    return {
        partsPerShipment,
        weightPerShipment,
        volumePerShipment,
        boxPerShipment,
        palletPerShipment,
        corrugatedBoxCostPerUnit,
        totalBoxCostPerShipment,
        palletCostPerUnit,
        totalPalletCostPerShipment,
        shrinkWrapCostPerUnit: input.shrinkWrap ? ShrinkWrapCost : 0,
        totalShrinkWrapCost,
        totalPackagingCostPerShipment,
        totalPackagingCostPerUnit,
        esgImpactPerBox,
        esgImpactPerPallet,
        totalESGImpactPerPart,
        shipmentDensity: calculateShipmentDensity(
            weightPerShipment,
            volumePerShipment
        )
    }
}
