/**
 * Sheet Metal Test Data
 * Contains test data for sheet metal manufacturing processes
 */

export const SheetMetalTestData = {
    // Configuration
    config: {
        baseUrl: 'https://qa.truevaluehub.com',
        defaultTimeout: 30000
    },

    // Project Information
    project: {
        projectId: '14783', // Update with actual sheet metal project ID
        projectName: 'Sheet Metal Test Project'
    },

    // Part Information
    part: {
        internalPartNumber: 'SM-001',
        drawingNumber: 'DWG-SM-001',
        revisionNumber: 'A',
        partDescription: 'Sheet Metal Test Part',
        manufacturingCategory: 'Sheet Metal',
        bomQty: 1,
        annualVolume: 10000,
        lotSize: 100,
        productLifeRemaining: 5,
        lifetimeQtyRemaining: 50000
    },

    // Material Information
    material: {
        materialCategory: 'Metal',
        materialFamily: 'Steel',
        descriptionGrade: 'Mild Steel',
        stockForm: 'Sheet',
        thickness: 2.0, // mm
        density: 7.85, // g/cm³
        scrapPrice: 0.50, // per kg
        materialPrice: 2.50, // per kg
        volumePurchased: 1000,
        volumeDiscount: 5,
        partLength: 100, // mm
        partWidth: 50, // mm
        partHeight: 10, // mm
        netWeight: 0.5, // kg
        yieldStrength: 250, // MPa
        tensileStrength: 400, // MPa
        shearingStrength: 300 // MPa
    },

    // Bending Process
    bending: {
        processType: 'Bending',
        machineType: 'Manual',
        bendingLineLength: 100, // mm
        noOfBends: 2,
        innerRadius: 3, // mm
        theoreticalForce: 15, // tons
        recommendedTonnage: 18.75, // tons (1.25 x theoretical force)
        cycleTime: 12, // seconds
        setupTime: 30, // minutes
        efficiency: 0.85 // 85%
    },

    // Soft Bending Process
    softBending: {
        processType: 'Soft Bending',
        machineType: 'Semi-Automatic',
        bendingLineLength: 150,
        noOfBends: 3,
        innerRadius: 4,
        cycleTime: 18,
        setupTime: 45,
        efficiency: 0.90
    },

    // Laser Cutting Process
    laserCutting: {
        processType: 'Laser Cutting',
        machineType: 'Automatic',
        cuttingLength: 200, // mm
        cuttingSpeed: 50, // mm/sec
        pierceTime: 2, // seconds
        cycleTime: 10,
        setupTime: 20,
        efficiency: 0.95
    },

    // Stamping Progressive Process
    stampingProgressive: {
        processType: 'Stamping Progressive',
        machineType: 'Automatic',
        noOfStages: 4,
        strokeRate: 60, // strokes per minute
        cycleTime: 1, // seconds
        setupTime: 60,
        efficiency: 0.92
    },

    // Manufacturing Costs
    costs: {
        lowSkilledLaborRate: 15, // $/hr
        semiSkilledLaborRate: 20, // $/hr
        highSkilledLaborRate: 30, // $/hr
        qaInspectorRate: 25, // $/hr
        noOfLowSkilledLabors: 1,
        noOfSemiSkilledLabors: 0,
        noOfHighSkilledLabors: 0,
        machineHourRate: 40, // $/hr
        electricityUnitCost: 0.12, // $/kWh
        samplingRate: 10, // %
        yieldPercentage: 98, // %
        partComplexity: 'Medium'
    },

    // Sustainability
    sustainability: {
        co2PerKgMaterial: 1.8, // kg CO2
        co2PerKwHr: 0.5, // kg CO2
        ratedPower: 10, // kW
        powerUtilization: 70, // %
        avgMachineUtilization: 80 // %
    },

    // Expected Results (to be populated during tests)
    expected: {
        directMachineCost: 0,
        directSetupCost: 0,
        directLaborCost: 0,
        qaInspectionCost: 0,
        yieldCost: 0,
        netProcessCost: 0,
        materialCost: 0,
        manufacturingCost: 0,
        exwPartCost: 0
    }
}

export default SheetMetalTestData
