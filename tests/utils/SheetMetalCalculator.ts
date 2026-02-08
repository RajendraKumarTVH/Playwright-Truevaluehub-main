/**
 * SheetMetalCalculator
 * Comprehensive utility class for sheet metal manufacturing calculations
 * Based on manufacturing-sheetmetal-calculator.service.ts
 * 
 * Supports 13+ Process Types:
 * 1. Bending
 * 2. Soft Bending
 * 3. Stamping Progressive
 * 4. Transfer Press
 * 5. Stamping Stage
 * 6. Forming
 * 7. Drawing
 * 8. TPP (Transfer Press Progressive)
 * 9. Cutting/Laser Cutting
 * 10. Oxy Cutting
 * 11. Tube Laser
 * 12. Tube Bending Metal
 * 13. Shearing
 */

import Logger from '../lib/LoggerUtil'

const logger = Logger

// ====================================================================
// ENUMS & CONSTANTS
// ====================================================================

export enum ProcessType {
    Bending = 1,
    SoftBending = 2,
    StampingProgressive = 3,
    TransferPress = 4,
    Stage = 5,
    Forming = 6,
    Drawing = 7,
    TPP = 8,
    Cutting = 9,
    OxyCutting = 10,
    TubeLaser = 11,
    TubeBending = 12,
    Shearing = 13
}

export enum StampingType {
    BlankingPunching = 1,
    Piercing = 2,
    Bending = 3,
    Forming = 4,
    Drawing = 5,
    Coining = 6,
    Compound = 7,
    ShallowDrawRect = 8,
    ShallowDrawCir = 9,
    RedrawRect = 10,
    RedrawCir = 11,
    Trimming = 12
}

export enum PartComplexity {
    Low = 1,
    Medium = 2,
    High = 3
}

export enum BendType {
    AirBending = 1,
    BottomBending = 2,
    Coining = 3
}

export interface BendingInput {
    ultimateTensileStrength: number // MPa
    partThickness: number // mm
    bendingLineLength: number // mm
    bendingCoefficient?: number
    lotSize?: number
    machineHourRate?: number
    cycleTime?: number
    skilledLaborRate?: number
    setupTime?: number
    lowSkilledLaborRate?: number
    noOfLowSkilledLabors?: number
    qaInspectorRate?: number
    inspectionTime?: number
    samplingRate?: number
    yieldPercentage?: number
    materialCostTotal?: number
    materialWeight?: number
    scrapPrice?: number
}

export interface SoftBendingInput extends BendingInput {
    noOfBends: number
    innerRadius: number
    partWeight: number // grams
    efficiency?: number
}

export interface StampingInput {
    thickness: number // mm
    lengthOfCut: number // mm
    shearingStrength: number // MPa
    strokeRate: number // strokes/min
    partComplexity: 'Low' | 'Medium' | 'High'
    lotSize: number
}

export class SheetMetalCalculator {
    /**
     * Calculate theoretical force for bending
     * Formula: (t² × L × UTS × K) / V / 9810
     * where:
     * t = thickness (mm)
     * L = bending line length (mm)
     * UTS = ultimate tensile strength (MPa)
     * K = bending coefficient (typically 1.33)
     * V = die opening
     */
    static calculateTheoreticalForce(input: BendingInput): number {
        const {
            partThickness,
            bendingLineLength,
            ultimateTensileStrength,
            bendingCoefficient = 1.33
        } = input

        const force = (
            Math.pow(partThickness, 1) *
            bendingLineLength *
            ultimateTensileStrength *
            bendingCoefficient
        ) / 9810

        logger.info(`[SheetMetal] Theoretical Force: ${force.toFixed(4)} tons`)
        return this.isValidNumber(force)
    }

    /**
     * Calculate recommended tonnage
     * Formula: Theoretical Force × 1.25
     */
    static calculateRecommendedTonnage(theoreticalForce: number): number {
        const tonnage = theoreticalForce * 1.25
        logger.info(`[SheetMetal] Recommended Tonnage: ${tonnage.toFixed(4)} tons`)
        return this.isValidNumber(tonnage)
    }

    /**
     * Calculate cycle time for bending
     * Formula: (2/60 + sheetLoadUnloadTime) × 60
     */
    static calculateBendingCycleTime(sheetLoadUnloadTime: number = 0.167): number {
        const cycleTime = (2 / 60 + sheetLoadUnloadTime) * 60
        logger.info(`[SheetMetal] Bending Cycle Time: ${cycleTime.toFixed(4)} sec`)
        return this.isValidNumber(cycleTime)
    }

    /**
     * Calculate soft bending force
     * Formula varies based on bend type (Air Bending, Bottom Bending, Coining)
     */
    static calculateSoftBendingForce(input: SoftBendingInput): {
        bendType: number
        dieOpeningThickness: number
        bendingForceKn: number
        bendingForceTon: number
        recommendedTonnage: number
    } {
        const { partThickness, innerRadius, bendingLineLength, ultimateTensileStrength } = input

        // Determine bend type
        let bendType: number
        if (innerRadius <= partThickness / 2) {
            bendType = 3 // Coining
        } else if (innerRadius <= partThickness) {
            bendType = 2 // Bottom Bending
        } else {
            bendType = 1 // Air Bending
        }

        // Die Opening/Thickness
        let dieOpeningThickness: number
        if (partThickness < 3) {
            dieOpeningThickness = 6
        } else if (partThickness < 10) {
            dieOpeningThickness = 8
        } else if (partThickness < 12) {
            dieOpeningThickness = 10
        } else {
            dieOpeningThickness = 12
        }

        // Die Opening V
        const dieOpeningV = partThickness * dieOpeningThickness

        // Bending Force in kN
        let bendingForceKn: number
        if (bendType === 1) { // Air Bending
            bendingForceKn = (1.33 * Math.pow(partThickness, 2) * (bendingLineLength / 1000) * ultimateTensileStrength) / dieOpeningV
        } else if (bendType === 2) { // Bottom Bending
            bendingForceKn = (2.67 * Math.pow(partThickness, 2) * (bendingLineLength / 1000) * ultimateTensileStrength) / dieOpeningV
        } else { // Coining
            bendingForceKn = 1.1 * partThickness * (bendingLineLength / 1000) * ultimateTensileStrength
        }

        // Convert to tons
        const bendingForceTon = bendingForceKn / 9.81
        const recommendedTonnage = Math.ceil(bendingForceTon * 1.25)

        logger.info(`[SheetMetal] Soft Bending:`)
        logger.info(`  Bend Type: ${bendType} (1=Air, 2=Bottom, 3=Coining)`)
        logger.info(`  Die Opening Thickness: ${dieOpeningThickness}`)
        logger.info(`  Bending Force: ${bendingForceTon.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage} tons`)

        return {
            bendType,
            dieOpeningThickness,
            bendingForceKn: this.isValidNumber(bendingForceKn),
            bendingForceTon: this.isValidNumber(bendingForceTon),
            recommendedTonnage: this.isValidNumber(recommendedTonnage)
        }
    }

    /**
     * Calculate soft bending cycle time
     * Includes process time, rotation time, and operation handling time
     */
    static calculateSoftBendingCycleTime(input: {
        ramDownTime: number
        ramUpTime: number
        dwellTime: number
        noOfBends: number
        partWeight: number
        efficiency: number
    }): {
        processTime: number
        rotationTime: number
        cycleTime: number
    } {
        const { ramDownTime, ramUpTime, dwellTime, noOfBends, partWeight, efficiency } = input

        // Process Time
        const processTime = ramDownTime + ramUpTime + dwellTime

        // Rotation Time (based on part weight)
        let rotationFactor: number
        if (partWeight < 2500) {
            rotationFactor = 4
        } else if (partWeight < 5000) {
            rotationFactor = 8
        } else if (partWeight < 27000) {
            rotationFactor = 15
        } else {
            rotationFactor = 30
        }

        const rotationTime = noOfBends > 1 ? rotationFactor * (noOfBends - 1) : 0

        // Operation Handling Time
        const handlingFactor = partWeight < 5000 ? 4 : partWeight < 10000 ? 8 : partWeight < 27000 ? 15 : 30
        const operationHandlingTime = handlingFactor * 2 + rotationTime

        // Total Cycle Time
        const cycleTime = (processTime * noOfBends + operationHandlingTime) / efficiency

        logger.info(`[SheetMetal] Soft Bending Cycle Time:`)
        logger.info(`  Process Time: ${processTime.toFixed(4)} sec`)
        logger.info(`  Rotation Time: ${rotationTime.toFixed(4)} sec`)
        logger.info(`  Operation Handling Time: ${operationHandlingTime.toFixed(4)} sec`)
        logger.info(`  Total Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            processTime: this.isValidNumber(processTime),
            rotationTime: this.isValidNumber(operationHandlingTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    /**
     * Calculate stamping force
     * Formula: (Length of Cut × Thickness × Shearing Strength) / 9810
     */
    static calculateStampingForce(input: StampingInput): {
        theoreticalForce: number
        recommendedTonnage: number
    } {
        const { lengthOfCut, thickness, shearingStrength } = input

        const theoreticalForce = (lengthOfCut * thickness * shearingStrength) / 9810
        const recommendedTonnage = theoreticalForce * 1.25

        logger.info(`[SheetMetal] Stamping Force:`)
        logger.info(`  Theoretical Force: ${theoreticalForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)

        return {
            theoreticalForce: this.isValidNumber(theoreticalForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage)
        }
    }

    /**
     * Calculate direct machine cost
     * Formula: (Machine Hour Rate / 3600) × Cycle Time
     */
    static calculateDirectMachineCost(machineHourRate: number, cycleTime: number): number {
        const cost = (machineHourRate / 3600) * cycleTime
        logger.info(`[SheetMetal] Direct Machine Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Calculate direct setup cost
     * Formula: ((Skilled Labor Rate + Machine Hour Rate) / 60) × Setup Time / Lot Size
     */
    static calculateDirectSetupCost(
        skilledLaborRate: number,
        machineHourRate: number,
        setupTime: number,
        lotSize: number
    ): number {
        const cost = (((skilledLaborRate + machineHourRate) / 60) * setupTime) / lotSize
        logger.info(`[SheetMetal] Direct Setup Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Calculate direct labor cost
     * Formula: (Labor Rate / 3600) × (Cycle Time × No. of Laborers)
     */
    static calculateDirectLaborCost(
        laborRate: number,
        cycleTime: number,
        noOfLaborers: number
    ): number {
        const cost = (laborRate / 3600) * (cycleTime * noOfLaborers)
        logger.info(`[SheetMetal] Direct Labor Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Calculate QA inspection cost
     * Formula: ((QA Rate / 60) × Inspection Time × Sampling Parts) / Lot Size
     */
    static calculateQAInspectionCost(
        qaRate: number,
        inspectionTime: number,
        samplingRate: number,
        lotSize: number
    ): number {
        const samplingParts = Math.ceil((samplingRate / 100) * lotSize)
        const cost = ((qaRate / 60) * inspectionTime * samplingParts) / lotSize
        logger.info(`[SheetMetal] QA Inspection Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Calculate yield cost
     * Formula: (1 - Yield%) × (Material Cost + Process Costs) - (1 - Yield%) × Scrap Value
     */
    static calculateYieldCost(
        yieldPercentage: number,
        materialCost: number,
        processCosts: number,
        materialWeight: number,
        scrapPrice: number
    ): number {
        const yieldFactor = 1 - (yieldPercentage / 100)
        const scrapValue = (materialWeight * scrapPrice) / 1000
        const cost = yieldFactor * (materialCost + processCosts) - yieldFactor * scrapValue
        logger.info(`[SheetMetal] Yield Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Calculate net process cost
     * Formula: Direct Machine Cost + Direct Setup Cost + Direct Labor Cost + QA Inspection Cost + Yield Cost
     */
    static calculateNetProcessCost(
        directMachineCost: number,
        directSetupCost: number,
        directLaborCost: number,
        qaInspectionCost: number,
        yieldCost: number
    ): number {
        const cost = directMachineCost + directSetupCost + directLaborCost + qaInspectionCost + yieldCost
        logger.info(`[SheetMetal] Net Process Cost: $${cost.toFixed(4)}`)
        return this.isValidNumber(cost)
    }

    /**
     * Utility method to ensure valid numbers (replaces NaN, Infinity with 0)
     */
    private static isValidNumber(value: number): number {
        if (isNaN(value) || !isFinite(value)) {
            return 0
        }
        return value
    }

    /**
     * Round to specified decimal places
     */
    static round(value: number, decimals: number = 4): number {
        const multiplier = Math.pow(10, decimals)
        return Math.round(value * multiplier) / multiplier
    }

    // ====================================================================
    // FORMING CALCULATIONS
    // ====================================================================

    /**
     * Calculate forming force
     * Formula: Blank Area × Forming Pressure
     */
    static calculateFormingForce(input: {
        blankArea: number // mm²
        formingPressure: number // MPa
    }): {
        formingForce: number
        recommendedTonnage: number
    } {
        const { blankArea, formingPressure } = input

        // Converting area from mm² to m² and pressure from MPa to Pa
        const formingForce = (blankArea / 1000000) * (formingPressure * 1000000) / 9810
        const recommendedTonnage = formingForce * 1.25

        logger.info(`[SheetMetal] Forming Force:`)
        logger.info(`  Blank Area: ${blankArea} mm²`)
        logger.info(`  Forming Pressure: ${formingPressure} MPa`)
        logger.info(`  Forming Force: ${formingForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)

        return {
            formingForce: this.isValidNumber(formingForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage)
        }
    }

    // ====================================================================
    // DRAWING CALCULATIONS
    // ====================================================================

    /**
     * Calculate drawing force
     * Formula: (π × Perimeter × Thickness × Tensile Strength × Draw K-Factor) / 9806.65
     */
    static calculateDrawingForce(input: {
        perimeter: number // mm
        thickness: number // mm
        tensileStrength: number // MPa
        drawKFactor?: number
        isShallowDraw?: boolean
    }): {
        theoreticalForce: number
        recommendedTonnage: number
        hlFactor: number
    } {
        const { perimeter, thickness, tensileStrength, drawKFactor = 1.15, isShallowDraw = true } = input

        let theoreticalForce: number

        if (isShallowDraw) {
            // For Shallow Drawing (Rectangular/Circular)
            theoreticalForce = (3.14 * perimeter * thickness * tensileStrength * drawKFactor) / 9806.65
        } else {
            // For Redrawing
            theoreticalForce = (3.14 * perimeter * tensileStrength * drawKFactor) / 9806.65
        }

        const recommendedTonnage = theoreticalForce * 1.2

        logger.info(`[SheetMetal] Drawing Force:`)
        logger.info(`  Perimeter: ${perimeter} mm`)
        logger.info(`  Thickness: ${thickness} mm`)
        logger.info(`  Tensile Strength: ${tensileStrength} MPa`)
        logger.info(`  Draw K-Factor: ${drawKFactor}`)
        logger.info(`  Theoretical Force: ${theoreticalForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)

        return {
            theoreticalForce: this.isValidNumber(theoreticalForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage),
            hlFactor: drawKFactor
        }
    }

    // ====================================================================
    // LASER CUTTING CALCULATIONS
    // ====================================================================

    /**
     * Calculate laser cutting cycle time
     * Formula: (Cutting Length / Cutting Speed) + (Pierce Time × No. of Starts)
     */
    static calculateLaserCuttingTime(input: {
        cuttingLength: number // mm
        cuttingSpeed: number // mm/sec
        numberOfStarts: number
        pierceTime: number // seconds
    }): {
        cuttingTime: number
        totalPierceTime: number
        cycleTime: number
    } {
        const { cuttingLength, cuttingSpeed, numberOfStarts, pierceTime } = input

        const cuttingTime = cuttingLength / cuttingSpeed
        const totalPierceTime = pierceTime * numberOfStarts
        const cycleTime = cuttingTime + totalPierceTime

        logger.info(`[SheetMetal] Laser Cutting Time:`)
        logger.info(`  Cutting Length: ${cuttingLength} mm`)
        logger.info(`  Cutting Speed: ${cuttingSpeed} mm/sec`)
        logger.info(`  Number of Starts: ${numberOfStarts}`)
        logger.info(`  Pierce Time: ${pierceTime} sec`)
        logger.info(`  Cutting Time: ${cuttingTime.toFixed(4)} sec`)
        logger.info(`  Total Pierce Time: ${totalPierceTime.toFixed(4)} sec`)
        logger.info(`  Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            cuttingTime: this.isValidNumber(cuttingTime),
            totalPierceTime: this.isValidNumber(totalPierceTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    // ====================================================================
    // OXY CUTTING CALCULATIONS
    // ====================================================================

    /**
     * Calculate oxy cutting cycle time
     * Similar to laser cutting but with different speeds
     */
    static calculateOxyCuttingTime(input: {
        cuttingLength: number // mm
        cuttingSpeed: number // mm/min
        numberOfStarts: number
        pierceTime: number // seconds
    }): {
        cuttingTime: number
        totalPierceTime: number
        cycleTime: number
    } {
        const { cuttingLength, cuttingSpeed, numberOfStarts, pierceTime } = input

        // Convert cutting speed from mm/min to mm/sec
        const cuttingSpeedSec = cuttingSpeed / 60
        const cuttingTime = cuttingLength / cuttingSpeedSec
        const totalPierceTime = pierceTime * numberOfStarts
        const cycleTime = cuttingTime + totalPierceTime

        logger.info(`[SheetMetal] Oxy Cutting Time:`)
        logger.info(`  Cutting Length: ${cuttingLength} mm`)
        logger.info(`  Cutting Speed: ${cuttingSpeed} mm/min`)
        logger.info(`  Cutting Time: ${cuttingTime.toFixed(4)} sec`)
        logger.info(`  Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            cuttingTime: this.isValidNumber(cuttingTime),
            totalPierceTime: this.isValidNumber(totalPierceTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    // ====================================================================
    // TUBE LASER CALCULATIONS
    // ====================================================================

    /**
     * Calculate tube laser cutting time
     */
    static calculateTubeLaserTime(input: {
        cuttingLength: number // mm
        cuttingSpeed: number // mm/sec
        numberOfStarts: number
        pierceTime: number // seconds
        rotationTime?: number // seconds
    }): {
        cuttingTime: number
        totalPierceTime: number
        rotationTime: number
        cycleTime: number
    } {
        const { cuttingLength, cuttingSpeed, numberOfStarts, pierceTime, rotationTime = 0 } = input

        const cuttingTime = cuttingLength / cuttingSpeed
        const totalPierceTime = pierceTime * numberOfStarts
        const cycleTime = cuttingTime + totalPierceTime + rotationTime

        logger.info(`[SheetMetal] Tube Laser Cutting Time:`)
        logger.info(`  Cutting Length: ${cuttingLength} mm`)
        logger.info(`  Cutting Time: ${cuttingTime.toFixed(4)} sec`)
        logger.info(`  Rotation Time: ${rotationTime.toFixed(4)} sec`)
        logger.info(`  Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            cuttingTime: this.isValidNumber(cuttingTime),
            totalPierceTime: this.isValidNumber(totalPierceTime),
            rotationTime: this.isValidNumber(rotationTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    // ====================================================================
    // TUBE BENDING CALCULATIONS
    // ====================================================================

    /**
     * Calculate tube bending cycle time and force
     */
    static calculateTubeBendingForce(input: {
        outerDiameter: number // mm
        wallThickness: number // mm
        bendRadius: number // mm
        tensileStrength: number // MPa
        noOfBends: number
    }): {
        bendingMoment: number
        theoreticalForce: number
        recommendedTonnage: number
        cycleTime: number
    } {
        const { outerDiameter, wallThickness, bendRadius, tensileStrength, noOfBends } = input

        // Section modulus for tube
        const innerDiameter = outerDiameter - 2 * wallThickness
        const sectionModulus = (Math.PI / 32) * ((Math.pow(outerDiameter, 4) - Math.pow(innerDiameter, 4)) / outerDiameter)

        // Bending moment
        const bendingMoment = sectionModulus * tensileStrength

        // Theoretical force based on bend radius
        const theoreticalForce = (bendingMoment / (bendRadius / 1000)) / 9810 // Convert to tons
        const recommendedTonnage = theoreticalForce * 1.25

        // Cycle time estimate: 15-30 sec per bend depending on tube size
        const timePerBend = outerDiameter < 50 ? 15 : outerDiameter < 100 ? 20 : 30
        const cycleTime = timePerBend * noOfBends

        logger.info(`[SheetMetal] Tube Bending:`)
        logger.info(`  Outer Diameter: ${outerDiameter} mm`)
        logger.info(`  Wall Thickness: ${wallThickness} mm`)
        logger.info(`  Bend Radius: ${bendRadius} mm`)
        logger.info(`  No. of Bends: ${noOfBends}`)
        logger.info(`  Bending Moment: ${bendingMoment.toFixed(4)} N·mm`)
        logger.info(`  Theoretical Force: ${theoreticalForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)
        logger.info(`  Cycle Time: ${cycleTime} sec`)

        return {
            bendingMoment: this.isValidNumber(bendingMoment),
            theoreticalForce: this.isValidNumber(theoreticalForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    // ====================================================================
    // SHEARING CALCULATIONS
    // ====================================================================

    /**
     * Calculate shearing force
     * Formula: Length × Thickness × Shear Strength / 9810
     */
    static calculateShearingForce(input: {
        lengthOfCut: number // mm
        thickness: number // mm
        shearStrength: number // MPa
    }): {
        theoreticalForce: number
        recommendedTonnage: number
    } {
        const { lengthOfCut, thickness, shearStrength } = input

        const theoreticalForce = (lengthOfCut * thickness * shearStrength) / 9810
        const recommendedTonnage = theoreticalForce * 1.25

        logger.info(`[SheetMetal] Shearing Force:`)
        logger.info(`  Length of Cut: ${lengthOfCut} mm`)
        logger.info(`  Thickness: ${thickness} mm`)
        logger.info(`  Shear Strength: ${shearStrength} MPa`)
        logger.info(`  Theoretical Force: ${theoreticalForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)

        return {
            theoreticalForce: this.isValidNumber(theoreticalForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage)
        }
    }

    /**
     * Calculate shearing cycle time
     */
    static calculateShearingCycleTime(input: {
        lengthOfCut: number // mm
        bladeSpeed?: number // mm/sec, default based on material
        loadingTime?: number // seconds
    }): {
        shearingTime: number
        cycleTime: number
    } {
        const { lengthOfCut, bladeSpeed = 50, loadingTime = 5 } = input

        const shearingTime = lengthOfCut / bladeSpeed
        const cycleTime = shearingTime + loadingTime

        logger.info(`[SheetMetal] Shearing Cycle Time:`)
        logger.info(`  Shearing Time: ${shearingTime.toFixed(4)} sec`)
        logger.info(`  Loading Time: ${loadingTime} sec`)
        logger.info(`  Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            shearingTime: this.isValidNumber(shearingTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    // ====================================================================
    // PROGRESSIVE STAMPING CALCULATIONS
    // ====================================================================

    /**
     * Calculate progressive stamping cycle time
     * Formula: 60 / (Stroke Rate × Efficiency × No. of Strokes)
     */
    static calculateProgressiveCycleTime(input: {
        strokeRate: number // strokes per minute
        noOfStrokes: number
        efficiency: number // 0-1
    }): {
        processTime: number
        cycleTime: number
    } {
        const { strokeRate, noOfStrokes, efficiency } = input

        const processTime = 60 / strokeRate / efficiency / noOfStrokes
        const cycleTime = processTime / efficiency

        logger.info(`[SheetMetal] Progressive Stamping Cycle Time:`)
        logger.info(`  Stroke Rate: ${strokeRate} spm`)
        logger.info(`  No. of Strokes: ${noOfStrokes}`)
        logger.info(`  Efficiency: ${(efficiency * 100).toFixed(2)}%`)
        logger.info(`  Process Time: ${processTime.toFixed(4)} sec`)
        logger.info(`  Cycle Time: ${cycleTime.toFixed(4)} sec`)

        return {
            processTime: this.isValidNumber(processTime),
            cycleTime: this.isValidNumber(cycleTime)
        }
    }

    /**
     * Calculate recommended bed size for progressive stamping
     */
    static calculateProgressiveBedSize(input: {
        unfoldedLength: number // mm
        unfoldedWidth: number // mm
        thickness: number // mm
        height: number // mm
        noOfStages: number
        stripLayout: number // no of impressions
        noOfStrokes: number
    }): {
        recBedLength: number
        recBedWidth: number
        maxDieSetHeight: number
    } {
        const { unfoldedLength, unfoldedWidth, thickness, height, noOfStages, stripLayout, noOfStrokes } = input

        // Recommended bed length
        const recBedLength = unfoldedWidth * 1.5 * noOfStages + 100

        // Recommended bed width
        let recBedWidth: number
        if (stripLayout == 1) {
            recBedWidth = unfoldedLength + 260
        } else {
            recBedWidth = unfoldedLength * noOfStrokes + 260
        }

        // Maximum die set height based on thickness
        let maxDieSetHeight: number
        if (thickness <= 2) {
            maxDieSetHeight = 427
        } else if (thickness <= 4) {
            maxDieSetHeight = 447
        } else {
            maxDieSetHeight = 487
        }

        logger.info(`[SheetMetal] Progressive Bed Size:`)
        logger.info(`  Recommended Bed Length: ${recBedLength.toFixed(2)} mm`)
        logger.info(`  Recommended Bed Width: ${recBedWidth.toFixed(2)} mm`)
        logger.info(`  Max Die Set Height: ${maxDieSetHeight} mm`)

        return {
            recBedLength: this.isValidNumber(recBedLength),
            recBedWidth: this.isValidNumber(recBedWidth),
            maxDieSetHeight: this.isValidNumber(maxDieSetHeight)
        }
    }

    // ====================================================================
    // TRIMMING CALCULATIONS
    // ====================================================================

    /**
     * Calculate trimming force
     * Formula: (Perimeter × Shear Strength × Thickness) / 9806.65
     */
    static calculateTrimmingForce(input: {
        perimeter: number // mm
        shearStrength: number // MPa
        thickness: number // mm
    }): {
        theoreticalForce: number
        recommendedTonnage: number
    } {
        const { perimeter, shearStrength, thickness } = input

        const theoreticalForce = (perimeter * shearStrength * thickness) / 9806.65
        const recommendedTonnage = theoreticalForce * 1.2

        logger.info(`[SheetMetal] Trimming Force:`)
        logger.info(`  Perimeter: ${perimeter} mm`)
        logger.info(`  Shear Strength: ${shearStrength} MPa`)
        logger.info(`  Thickness: ${thickness} mm`)
        logger.info(`  Theoretical Force: ${theoreticalForce.toFixed(4)} tons`)
        logger.info(`  Recommended Tonnage: ${recommendedTonnage.toFixed(4)} tons`)

        return {
            theoreticalForce: this.isValidNumber(theoreticalForce),
            recommendedTonnage: this.isValidNumber(recommendedTonnage)
        }
    }

    // ====================================================================
    // SETUP TIME CALCULATIONS
    // ====================================================================

    /**
     * Calculate setup time for bending based on bending line length
     */
    static calculateBendingSetupTime(bendingLineLength: number): number {
        let setupTime: number

        if (bendingLineLength < 500) {
            setupTime = 10
        } else if (bendingLineLength < 1000) {
            setupTime = 15
        } else if (bendingLineLength < 2000) {
            setupTime = 20
        } else {
            setupTime = 30
        }

        // Add 5 minutes for tool setup
        setupTime += 5

        logger.info(`[SheetMetal] Bending Setup Time: ${setupTime} min`)
        return this.isValidNumber(setupTime)
    }

    // ====================================================================
    // INSPECTION TIME CALCULATIONS
    // ====================================================================

    /**
     * Calculate inspection time based on part complexity
     */
    static calculateInspectionTime(partComplexity: PartComplexity): number {
        let inspectionTime: number

        switch (partComplexity) {
            case PartComplexity.Low:
                inspectionTime = 2
                break
            case PartComplexity.Medium:
                inspectionTime = 5
                break
            case PartComplexity.High:
                inspectionTime = 10
                break
            default:
                inspectionTime = 0
        }

        logger.info(`[SheetMetal] Inspection Time: ${inspectionTime} min (Complexity: ${PartComplexity[partComplexity]})`)
        return this.isValidNumber(inspectionTime)
    }
}

export default SheetMetalCalculator
