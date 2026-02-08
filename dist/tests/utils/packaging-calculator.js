"use strict";
/**
 * Packaging Calculator
 * TypeScript implementation based on Angular service calculations
 * Source: costing-packaging-information-calculator.service.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShrinkWrapCost = exports.MaterialTypeEnum = void 0;
exports.calculateShipmentDensity = calculateShipmentDensity;
exports.calculatePartsPerShipment = calculatePartsPerShipment;
exports.calculateWeightPerShipment = calculateWeightPerShipment;
exports.calculateVolumePerShipment = calculateVolumePerShipment;
exports.parsePackagingDimensions = parsePackagingDimensions;
exports.calculatePackagesNeeded = calculatePackagesNeeded;
exports.calculateTotalBoxCost = calculateTotalBoxCost;
exports.calculateTotalPalletCost = calculateTotalPalletCost;
exports.calculateShrinkWrapCost = calculateShrinkWrapCost;
exports.calculateTotalPackagingCost = calculateTotalPackagingCost;
exports.calculatePackagingCostPerUnit = calculatePackagingCostPerUnit;
exports.calculateTotalESGImpact = calculateTotalESGImpact;
exports.calculatePackaging = calculatePackaging;
var MaterialTypeEnum;
(function (MaterialTypeEnum) {
    MaterialTypeEnum["Box"] = "Box";
    MaterialTypeEnum["Pallet"] = "Pallet";
    MaterialTypeEnum["Protective"] = "Protective";
})(MaterialTypeEnum || (exports.MaterialTypeEnum = MaterialTypeEnum = {}));
// Constants
exports.ShrinkWrapCost = 0.5; // $ per unit
/**
 * Calculate shipment density
 * @param weightPerShipment Weight in kg
 * @param volumePerShipment Volume in m³
 * @returns Density in kg/m³
 */
function calculateShipmentDensity(weightPerShipment, volumePerShipment) {
    if (volumePerShipment === 0)
        return 0;
    return weightPerShipment / volumePerShipment;
}
/**
 * Calculate parts per shipment based on delivery frequency
 * @param annualVolume Annual volume
 * @param deliveryFrequency Delivery frequency in days
 * @returns Parts per shipment
 */
function calculatePartsPerShipment(annualVolume, deliveryFrequency) {
    return Math.round(annualVolume * (deliveryFrequency / 365));
}
/**
 * Calculate weight per shipment
 * @param partsPerShipment Parts per shipment
 * @param netWeight Net weight in grams
 * @returns Weight in kg
 */
function calculateWeightPerShipment(partsPerShipment, netWeight) {
    return Number(((partsPerShipment * netWeight) / 1000).toFixed(4));
}
/**
 * Calculate volume per shipment
 * @param partsPerShipment Parts per shipment
 * @param dimX Dimension X in mm
 * @param dimY Dimension Y in mm
 * @param dimZ Dimension Z in mm
 * @returns Volume in m³
 */
function calculateVolumePerShipment(partsPerShipment, dimX, dimY, dimZ) {
    return Number(((partsPerShipment * dimX * dimY * dimZ) / 1000000000).toFixed(4));
}
/**
 * Parse packaging dimensions from description
 * @param description Description like "102x102x102mm"
 * @returns {length, width, height} in mm
 */
function parsePackagingDimensions(description) {
    const parts = description.split('x');
    if (parts.length >= 3) {
        return {
            length: parseFloat(parts[0].trim()) || 0,
            width: parseFloat(parts[1].trim()) || 0,
            height: parseFloat(parts[2].trim()) || 0
        };
    }
    return { length: 0, width: 0, height: 0 };
}
/**
 * Calculate boxes or pallets needed per shipment
 * @param weightPerShipment Weight in kg
 * @param volumePerShipment Volume in m³
 * @param packageDimensions Package dimensions in mm
 * @param maxWeight Max weight capacity in kg
 * @returns Number of packages needed
 */
function calculatePackagesNeeded(weightPerShipment, volumePerShipment, packageDimensions, maxWeight) {
    const { length, width, height } = packageDimensions;
    const packageVolume = (length * width * height) / 1000000000; // Convert mm³ to m³
    if (packageVolume === 0)
        return 0;
    const maxDensity = maxWeight / (packageVolume * 0.8);
    const shipmentDensity = calculateShipmentDensity(weightPerShipment, volumePerShipment);
    let packagesNeeded;
    if (shipmentDensity > maxDensity) {
        // Weight-limited
        packagesNeeded = Math.ceil(weightPerShipment / maxWeight);
    }
    else {
        // Volume-limited
        packagesNeeded = Math.ceil(volumePerShipment / packageVolume);
    }
    return packagesNeeded;
}
/**
 * Calculate total box cost per shipment
 * @param boxPerShipment Boxes per shipment
 * @param boxCostPerUnit Cost per box
 * @returns Total box cost
 */
function calculateTotalBoxCost(boxPerShipment, boxCostPerUnit) {
    return Number((boxPerShipment * boxCostPerUnit).toFixed(4));
}
/**
 * Calculate total pallet cost per shipment
 * @param palletPerShipment Pallets per shipment
 * @param palletCostPerUnit Cost per pallet
 * @returns Total pallet cost
 */
function calculateTotalPalletCost(palletPerShipment, palletCostPerUnit) {
    return Number((palletPerShipment * palletCostPerUnit).toFixed(4));
}
/**
 * Calculate shrink wrap cost
 * @param shrinkWrap Whether shrink wrap is used
 * @param palletPerShipment Pallets per shipment
 * @param shrinkWrapCostPerUnit Cost per shrink wrap unit
 * @returns Total shrink wrap cost
 */
function calculateShrinkWrapCost(shrinkWrap, palletPerShipment, shrinkWrapCostPerUnit = exports.ShrinkWrapCost) {
    if (!shrinkWrap)
        return 0;
    return Number((shrinkWrapCostPerUnit * palletPerShipment).toFixed(4));
}
/**
 * Calculate total packaging cost per shipment
 * @param totalBoxCost Total box cost
 * @param totalPalletCost Total pallet cost
 * @param totalShrinkWrapCost Total shrink wrap cost
 * @param additionalProtectiveCost Additional protective packaging cost
 * @returns Total packaging cost per shipment
 */
function calculateTotalPackagingCost(totalBoxCost, totalPalletCost, totalShrinkWrapCost, additionalProtectiveCost = 0) {
    return Number((totalBoxCost +
        totalPalletCost +
        totalShrinkWrapCost +
        additionalProtectiveCost).toFixed(4));
}
/**
 * Calculate packaging cost per unit
 * @param totalPackagingCost Total packaging cost per shipment
 * @param partsPerShipment Parts per shipment
 * @returns Cost per unit
 */
function calculatePackagingCostPerUnit(totalPackagingCost, partsPerShipment) {
    if (partsPerShipment === 0)
        return 0;
    return Number((totalPackagingCost / partsPerShipment).toFixed(4));
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
function calculateTotalESGImpact(boxPerShipment, palletPerShipment, partsPerShipment, esgPerBox, esgPerPallet) {
    if (partsPerShipment === 0)
        return 0;
    return Number(((esgPerBox * boxPerShipment + esgPerPallet * palletPerShipment) /
        partsPerShipment).toFixed(4));
}
/**
 * Calculate complete packaging information
 * @param input Packaging input parameters
 * @returns Complete packaging calculations
 */
function calculatePackaging(input) {
    // Calculate parts per shipment
    const partsPerShipment = calculatePartsPerShipment(input.eav, input.deliveryFrequency);
    // Calculate weight and volume
    const weightPerShipment = calculateWeightPerShipment(partsPerShipment, input.netWeight);
    const volumePerShipment = calculateVolumePerShipment(partsPerShipment, input.dimX, input.dimY, input.dimZ);
    // Get selected packaging materials
    const selectedBox = input.corrugatedBoxList.find((b) => b.materialMasterId === input.corrugatedBoxId);
    const selectedPallet = input.palletList.find((p) => p.materialMasterId === input.palletId);
    // Parse dimensions
    const boxDimensions = parsePackagingDimensions((selectedBox === null || selectedBox === void 0 ? void 0 : selectedBox.materialDescription) || '');
    const palletDimensions = parsePackagingDimensions((selectedPallet === null || selectedPallet === void 0 ? void 0 : selectedPallet.materialDescription) || '');
    // Calculate quantities needed
    const boxPerShipment = calculatePackagesNeeded(weightPerShipment, volumePerShipment, boxDimensions, (selectedBox === null || selectedBox === void 0 ? void 0 : selectedBox.maxWeight) || 0);
    const palletPerShipment = calculatePackagesNeeded(weightPerShipment, volumePerShipment, palletDimensions, (selectedPallet === null || selectedPallet === void 0 ? void 0 : selectedPallet.maxWeight) || 0);
    // Calculate costs
    const corrugatedBoxCostPerUnit = (selectedBox === null || selectedBox === void 0 ? void 0 : selectedBox.price) || 0;
    const palletCostPerUnit = (selectedPallet === null || selectedPallet === void 0 ? void 0 : selectedPallet.price) || 0;
    const totalBoxCostPerShipment = calculateTotalBoxCost(boxPerShipment, corrugatedBoxCostPerUnit);
    const totalPalletCostPerShipment = calculateTotalPalletCost(palletPerShipment, palletCostPerUnit);
    const totalShrinkWrapCost = calculateShrinkWrapCost(input.shrinkWrap, palletPerShipment);
    const totalPackagingCostPerShipment = calculateTotalPackagingCost(totalBoxCostPerShipment, totalPalletCostPerShipment, totalShrinkWrapCost);
    const totalPackagingCostPerUnit = calculatePackagingCostPerUnit(totalPackagingCostPerShipment, partsPerShipment);
    // Calculate ESG
    const esgImpactPerBox = (selectedBox === null || selectedBox === void 0 ? void 0 : selectedBox.esgImpactCO2Kg) || 0;
    const esgImpactPerPallet = (selectedPallet === null || selectedPallet === void 0 ? void 0 : selectedPallet.esgImpactCO2Kg) || 0;
    const totalESGImpactPerPart = calculateTotalESGImpact(boxPerShipment, palletPerShipment, partsPerShipment, esgImpactPerBox, esgImpactPerPallet);
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
        shrinkWrapCostPerUnit: input.shrinkWrap ? exports.ShrinkWrapCost : 0,
        totalShrinkWrapCost,
        totalPackagingCostPerShipment,
        totalPackagingCostPerUnit,
        esgImpactPerBox,
        esgImpactPerPallet,
        totalESGImpactPerPart,
        shipmentDensity: calculateShipmentDensity(weightPerShipment, volumePerShipment)
    };
}
