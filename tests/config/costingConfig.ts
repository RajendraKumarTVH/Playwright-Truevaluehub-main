// ==================== ENUMS ====================

export enum ProcessType {
    MigWelding = 39,
    TigWelding = 67,
    StickWelding = 209,
    SpotWelding = 59,
    SeamWelding = 218,
    SubMergedArcWelding = 62,
    Sonicwelding = 58,
    FrictionWelding = 15,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    LaserWelding = 32,
    Brazing = 220,
}

export enum PrimaryProcessType {
    MigWelding = 57,
    TigWelding = 58,
    StickWelding = 78,
    SpotWelding = 77,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    SeamWelding = 88,
}

export enum PartComplexity {
    Low = 1,
    Medium = 2,
    High = 3,
}

export enum MachineType {
    Automatic = 1,
    SemiAuto = 2,
    Manual = 3,
}

// ==================== COSTING CONFIG CLASS ====================

export class CostingConfig {
    /**
     * Get weld position list
     */
    weldPositionList() {
        return [
            { id: 1, name: 'Flat' },
            { id: 2, name: 'Horizontal' },
            { id: 3, name: 'Vertical' },
            { id: 4, name: 'OverHead' },
            { id: 6, name: 'Combination' },
        ]
    }

    /**
     * Get type of welds
     */
    typeOfWelds() {
        return [
            { id: 1, name: 'Fillet' },
            { id: 2, name: 'Square' },
            { id: 3, name: 'Plug' },
            { id: 4, name: 'Bevel/Flare/ V Groove' },
            { id: 5, name: 'U/J Groove' },
        ]
    }

    /**
     * Get material base types
     */
    typeOfMaterialBase() {
        return [
            { id: 1, name: 'Carbon Steel' },
            { id: 2, name: 'SS 301 to 308' },
            { id: 3, name: 'SS316' },
        ]
    }

    /**
     * Get welding default percentage (yield/sampling rate) based on process and complexity
     * @param processTypeId - Process type ID
     * @param partComplexity - Part complexity (1=Low, 2=Medium, 3=High)
     * @param percentageType - 'yieldPercentage' or 'samplingRate'
     */
    weldingDefaultPercentage(
        processTypeId: number,
        partComplexity = 1,
        percentageType: 'yieldPercentage' | 'samplingRate' = 'yieldPercentage'
    ): number {
        const vals = [
            {
                processTypeId: ProcessType.Sonicwelding,
                yieldPercentage: { 1: 98, 2: 97, 3: 96 },
                samplingRate: { 1: 1.95, 2: 4, 3: 6 },
            },
            {
                processTypeId: ProcessType.TigWelding,
                yieldPercentage: { 1: 98, 2: 96, 3: 94 },
                samplingRate: { 1: 4, 2: 6, 3: 8 },
            },
            {
                processTypeId: ProcessType.SpotWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 },
            },
            {
                processTypeId: ProcessType.SeamWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 },
            },
            {
                processTypeId: ProcessType.MigWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 5, 2: 8, 3: 10 },
            },
            {
                processTypeId: ProcessType.StickWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 5, 2: 8, 3: 10 },
            },
            {
                processTypeId: ProcessType.FrictionWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 },
            },
        ]

        const config = vals.find((v) => v.processTypeId === processTypeId)
        if (!config) return 0

        const typeConfig = config[percentageType] as Record<number, number>
        return typeConfig[partComplexity] || 0
    }

    /**
     * Get welding position list with efficiencies
     * @param weldType - Type of welding ('stickWelding' or 'welding')
     */
    weldingPositionList(weldType = 'welding') {
        if (weldType === 'stickWelding') {
            return [
                {
                    id: 1,
                    name: '1G Manual',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 75,
                    EffeciencySemiAuto: 75,
                },
                {
                    id: 2,
                    name: '2G Manual',
                    EffeciencyAuto: 65,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 65,
                },
                {
                    id: 3,
                    name: '3G Manual',
                    EffeciencyAuto: 60,
                    EffeciencyManual: 60,
                    EffeciencySemiAuto: 60,
                },
                {
                    id: 4,
                    name: '4G Manual',
                    EffeciencyAuto: 50,
                    EffeciencyManual: 50,
                    EffeciencySemiAuto: 50,
                },
                {
                    id: 5,
                    name: '1G Robotic',
                    EffeciencyAuto: 85,
                    EffeciencyManual: 85,
                    EffeciencySemiAuto: 85,
                },
                {
                    id: 6,
                    name: '2G Robotic',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 75,
                    EffeciencySemiAuto: 75,
                },
                {
                    id: 7,
                    name: '3G Robotic',
                    EffeciencyAuto: 70,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 70,
                },
                {
                    id: 8,
                    name: '4G Robotic',
                    EffeciencyAuto: 60,
                    EffeciencyManual: 60,
                    EffeciencySemiAuto: 60,
                },
            ]
        } else {
            return [
                {
                    id: 1,
                    name: 'Flat',
                    EffeciencyAuto: 80,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 80,
                },
                {
                    id: 2,
                    name: 'Horizontal',
                    EffeciencyAuto: 80,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 80,
                },
                {
                    id: 3,
                    name: 'Vertical',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 75,
                },
                {
                    id: 4,
                    name: 'OverHead',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 75,
                },
            ]
        }
    }

    /**
     * Get number of tack welds based on weld length
     * @param len - Weld length in mm
     */
    noOfTrackWeld(len: number): number {
        const weldList = [
            { toLength: 100, noOfWeld: 2 },
            { toLength: 250, noOfWeld: 3 },
            { toLength: 500, noOfWeld: 4 },
            { toLength: 1000, noOfWeld: 8 },
            { toLength: 1500, noOfWeld: 12 },
            { toLength: 2000, noOfWeld: 16 },
            { toLength: 2500, noOfWeld: 20 },
            { toLength: 3000, noOfWeld: 24 },
            { toLength: 3500, noOfWeld: 30 },
            { toLength: 4000, noOfWeld: 34 },
            { toLength: 4500, noOfWeld: 38 },
            { toLength: 5000, noOfWeld: 44 },
            { toLength: 5500, noOfWeld: 50 },
            { toLength: 6000, noOfWeld: 54 },
            { toLength: 6500, noOfWeld: 58 },
            { toLength: 7000, noOfWeld: 62 },
            { toLength: 7500, noOfWeld: 68 },
            { toLength: 8000, noOfWeld: 72 },
            { toLength: 8500, noOfWeld: 76 },
            { toLength: 9000, noOfWeld: 80 },
            { toLength: 1000000, noOfWeld: 85 },
        ]
        return (
            weldList.find((x) => x.toLength >= len)?.noOfWeld ||
            weldList[weldList.length - 1].noOfWeld
        )
    }

    /**
     * Get number of weld passes based on weld leg length
     * @param len - Weld leg length in mm
     * @param weldType - Type of welding  ('stickWelding' or 'welding')
     */
    weldPass(len: number, weldType = 'welding'): number {
        let weldList = []
        if (weldType === 'stickWelding') {
            weldList = [
                { toWeldLegLength: 3, noOfWeldPasses: 1 },
                { toWeldLegLength: 6, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 3 },
            ]
        } else {
            weldList = [
                { toWeldLegLength: 8, noOfWeldPasses: 1 },
                { toWeldLegLength: 12, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 0 },
            ]
        }
        return (
            weldList.find((x) => x.toWeldLegLength >= len)?.noOfWeldPasses ||
            weldList[weldList.length - 1].noOfWeldPasses
        )
    }

    /**
     * Get welding values for stick welding
     */
    weldingValuesForStickWelding() {
        return [
            {
                id: 1,
                ToPartThickness: 3.175,
                WireDiameter: 1.6,
                Current: 33,
                Voltage: 22.5,
                TravelSpeed: 1.25,
            },
            {
                id: 2,
                ToPartThickness: 4.7625,
                WireDiameter: 2.4,
                Current: 83,
                Voltage: 23.5,
                TravelSpeed: 1.5,
            },
            {
                id: 3,
                ToPartThickness: 6.35,
                WireDiameter: 3.2,
                Current: 120,
                Voltage: 23.5,
                TravelSpeed: 1.67,
            },
            {
                id: 4,
                ToPartThickness: 8,
                WireDiameter: 4,
                Current: 165,
                Voltage: 24,
                TravelSpeed: 1.88,
            },
            {
                id: 5,
                ToPartThickness: 9.525,
                WireDiameter: 4.8,
                Current: 208,
                Voltage: 25.5,
                TravelSpeed: 2,
            },
            {
                id: 6,
                ToPartThickness: 12.7,
                WireDiameter: 6.4,
                Current: 313,
                Voltage: 26.5,
                TravelSpeed: 2.17,
            },
            {
                id: 7,
                ToPartThickness: 10000,
                WireDiameter: 8,
                Current: 400,
                Voltage: 28,
                TravelSpeed: 2.5,
            },
        ]
    }

    /**
     * Get welding values for MIG welding machine type
     */
    weldingValuesForMachineType() {
        return [
            // Automatic (id: 1)
            {
                id: 1,
                FromPartThickness: 0,
                ToPartThickness: 1,
                WireDiameter: 0.8,
                Voltage: 15,
                Current: 65,
                WireFeed: 4,
                TravelSpeed: 8,
            },
            {
                id: 1,
                FromPartThickness: 1.1,
                ToPartThickness: 1.6,
                WireDiameter: 1,
                Voltage: 18,
                Current: 145,
                WireFeed: 5.5,
                TravelSpeed: 8.5,
            },
            {
                id: 1,
                FromPartThickness: 1.7,
                ToPartThickness: 3,
                WireDiameter: 1.2,
                Voltage: 18,
                Current: 140,
                WireFeed: 3.6,
                TravelSpeed: 6.5,
            },
            {
                id: 1,
                FromPartThickness: 3.1,
                ToPartThickness: 6,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 260,
                WireFeed: 7,
                TravelSpeed: 7.9,
            },
            {
                id: 1,
                FromPartThickness: 6.1,
                ToPartThickness: 10,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 290,
                WireFeed: 3.6,
                TravelSpeed: 7.4,
            },
            {
                id: 1,
                FromPartThickness: 10.1,
                ToPartThickness: 15,
                WireDiameter: 1.2,
                Voltage: 29.5,
                Current: 310,
                WireFeed: 11,
                TravelSpeed: 6.5,
            },
            {
                id: 1,
                FromPartThickness: 15.1,
                ToPartThickness: 100000,
                WireDiameter: 2,
                Voltage: 35,
                Current: 400,
                WireFeed: 12,
                TravelSpeed: 7.8,
            },
            // Manual (id: 3)
            {
                id: 3,
                FromPartThickness: 0,
                ToPartThickness: 1,
                WireDiameter: 0.8,
                Voltage: 15,
                Current: 65,
                WireFeed: 3,
                TravelSpeed: 6,
            },
            {
                id: 3,
                FromPartThickness: 1.1,
                ToPartThickness: 1.6,
                WireDiameter: 1,
                Voltage: 18,
                Current: 145,
                WireFeed: 4.125,
                TravelSpeed: 6.38,
            },
            {
                id: 3,
                FromPartThickness: 1.7,
                ToPartThickness: 3,
                WireDiameter: 1.2,
                Voltage: 18,
                Current: 140,
                WireFeed: 2.7,
                TravelSpeed: 4.88,
            },
            {
                id: 3,
                FromPartThickness: 3.1,
                ToPartThickness: 6,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 260,
                WireFeed: 5.25,
                TravelSpeed: 5.93,
            },
            {
                id: 3,
                FromPartThickness: 6.1,
                ToPartThickness: 10,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 290,
                WireFeed: 2.7,
                TravelSpeed: 5.55,
            },
            {
                id: 3,
                FromPartThickness: 10.1,
                ToPartThickness: 15,
                WireDiameter: 1.2,
                Voltage: 29.5,
                Current: 310,
                WireFeed: 8.25,
                TravelSpeed: 4.88,
            },
            {
                id: 3,
                FromPartThickness: 15.1,
                ToPartThickness: 100000,
                WireDiameter: 2,
                Voltage: 35,
                Current: 400,
                WireFeed: 9,
                TravelSpeed: 5.85,
            },
        ]
    }

    /**
     * Get TIG welding values for machine type
     */
    tigWeldingValuesForMachineType() {
        return [
            // Automatic (id: 1)
            {
                id: 1,
                FromPartThickness: 0,
                ToPartThickness: 1.6,
                WireDiameter: 1.6,
                Voltage: 15,
                Current: 90,
                WireFeed: 4,
                TravelSpeed: 4,
            },
            {
                id: 1,
                FromPartThickness: 1.7,
                ToPartThickness: 3.2,
                WireDiameter: 2.4,
                Voltage: 18,
                Current: 130,
                WireFeed: 5.5,
                TravelSpeed: 4,
            },
            {
                id: 1,
                FromPartThickness: 3.3,
                ToPartThickness: 4.8,
                WireDiameter: 3.2,
                Voltage: 18,
                Current: 225,
                WireFeed: 3.6,
                TravelSpeed: 4,
            },
            {
                id: 1,
                FromPartThickness: 4.9,
                ToPartThickness: 100006.4,
                WireDiameter: 4.8,
                Voltage: 27,
                Current: 313,
                WireFeed: 7,
                TravelSpeed: 3,
            },
            // Manual (id: 3)
            {
                id: 3,
                FromPartThickness: 0,
                ToPartThickness: 1.6,
                WireDiameter: 1.6,
                Voltage: 15,
                Current: 90,
                WireFeed: 3,
                TravelSpeed: 3,
            },
            {
                id: 3,
                FromPartThickness: 1.7,
                ToPartThickness: 3.2,
                WireDiameter: 2.4,
                Voltage: 18,
                Current: 130,
                WireFeed: 4.125,
                TravelSpeed: 3,
            },
            {
                id: 3,
                FromPartThickness: 3.3,
                ToPartThickness: 4.8,
                WireDiameter: 3.2,
                Voltage: 18,
                Current: 225,
                WireFeed: 2.7,
                TravelSpeed: 3,
            },
            {
                id: 3,
                FromPartThickness: 4.9,
                ToPartThickness: 100006.4,
                WireDiameter: 4.8,
                Voltage: 27,
                Current: 312.5,
                WireFeed: 5.25,
                TravelSpeed: 3,
            },
        ]
    }

    /**
     * Get welding values for part handling based on weight
     * @param weldType - Type of welding
     */
    weldingValuesForPartHandling(weldType = 'welding') {
        if (weldType === 'spotWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 2, unloading: 2 },
                { id: 2, toPartWeight: 4, loading: 5, unloading: 5 },
                { id: 3, toPartWeight: 10, loading: 10, unloading: 10 },
                { id: 4, toPartWeight: 25, loading: 20, unloading: 20 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 },
            ]
        } else if (weldType === 'seamWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 8, unloading: 8 },
                { id: 2, toPartWeight: 5, loading: 16, unloading: 16 },
                { id: 3, toPartWeight: 10, loading: 24, unloading: 24 },
                { id: 4, toPartWeight: 20, loading: 32, unloading: 32 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 },
            ]
        } else if (weldType === 'stickWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 10, unloading: 10 },
                { id: 2, toPartWeight: 4, loading: 30, unloading: 30 },
                { id: 3, toPartWeight: 10, loading: 60, unloading: 60 },
                { id: 4, toPartWeight: 25, loading: 90, unloading: 90 },
                { id: 5, toPartWeight: 10000, loading: 180, unloading: 180 },
            ]
        } else {
            return []
        }
    }

    /**
     * Get loading/unloading time based on part weight
     * @param weight - Part weight in kg
     */
    loadingUnloadingTime(weight: number): number {
        const data = [
            { id: 1, fromWeight: 0, toWeight: 5, time: 5 },
            { id: 2, fromWeight: 5.01, toWeight: 10, time: 7 },
            { id: 3, fromWeight: 10.01, toWeight: 50, time: 10 },
            { id: 4, fromWeight: 50.01, toWeight: 100, time: 15 },
            { id: 5, fromWeight: 100.01, toWeight: 500, time: 20 },
            { id: 6, fromWeight: 500.01, toWeight: 1000, time: 30 },
            { id: 7, fromWeight: 1000.01, toWeight: 10000000, time: 60 },
        ]
        return data.find((x) => x.fromWeight <= weight && x.toWeight >= weight)?.time || 5
    }

    /**
     * Get part complexity values
     */
    partComplexityValues() {
        return [
            { id: 1, ShapeFactor: 6 },
            { id: 2, ShapeFactor: 8 },
            { id: 3, ShapeFactor: 10 },
        ]
    }

    /**
     * Get machine type manufacturing data
     */
    machineTypeManufacturingData() {
        return [
            { id: 1, Handlingtime: 5, DirectLabour: 0.33, BourdanRate: 125 },
            { id: 2, Handlingtime: 7, DirectLabour: 0.5, BourdanRate: 115 },
            { id: 3, Handlingtime: 10, DirectLabour: 1, BourdanRate: 100 },
        ]
    }

    /**
     * Get manipulator type based on mold weight
     */
    manipulatorType() {
        return [
            { id: 1, fromWeight: 0, toWeight: 4000, type: 1 },
            { id: 2, fromWeight: 4000.01, toWeight: 15000, type: 2 },
            { id: 3, fromWeight: 15000.01, toWeight: 10000000000, type: 3 },
        ]
    }

    /**
     * Get mold loading time based on mold length
     * @param moldLength - Mold length in mm
     */
    moldLoadingTime(moldLength: number): number {
        const data = [
            { moldLength: 800, loadingTime: 120 },
            { moldLength: 1200, loadingTime: 150 },
            { moldLength: 2000, loadingTime: 180 },
            { moldLength: 2500, loadingTime: 210 },
            { moldLength: 3000, loadingTime: 240 },
            { moldLength: 4000, loadingTime: 300 },
            { moldLength: 10000000, loadingTime: 360 },
        ]
        return data.find((x) => x.moldLength >= moldLength)?.loadingTime || data[data.length - 1].loadingTime
    }

    /**
     * Get welding machine values for seam welding
     */
    weldingMachineValuesForSeamWelding() {
        return [
            { id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
            { id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
            { id: 3, machine: 'FN-160-H', weldingEfficiency: 31.05 },
            { id: 4, machine: 'FN-100-E', weldingEfficiency: 27.945 },
            { id: 5, machine: 'FN-160-E', weldingEfficiency: 25.1505 }
        ]
    }

    /**
     * Get spot welding values for machine type
     */
    spotWeldingValuesForMachineType() {
        return [
            {
                id: 1,
                toPartThickness: 0.254,
                weldForce: 353,
                weldTime: 4,
                holdTime: 5,
                weldCurrent: { 6: 4000, 12: 3200, 18: 2600 },
                openCircuitVoltage: 1.6
            },
            {
                id: 2,
                toPartThickness: 0.5334,
                weldForce: 538,
                weldTime: 6,
                holdTime: 8,
                weldCurrent: { 6: 6500, 12: 5200, 18: 4225 },
                openCircuitVoltage: 1.6
            },
            {
                id: 3,
                toPartThickness: 0.7874,
                weldForce: 719,
                weldTime: 8,
                holdTime: 10,
                weldCurrent: { 6: 8000, 12: 6400, 18: 5200 },
                openCircuitVoltage: 1.6
            },
            {
                id: 4,
                toPartThickness: 1.016,
                weldForce: 908,
                weldTime: 10,
                holdTime: 12,
                weldCurrent: { 6: 8800, 12: 7040, 18: 5720 },
                openCircuitVoltage: 1.6
            },
            {
                id: 5,
                toPartThickness: 1.27,
                weldForce: 1221,
                weldTime: 14,
                holdTime: 16,
                weldCurrent: { 6: 9600, 12: 7680, 18: 6240 },
                openCircuitVoltage: 1.6
            },
            {
                id: 6,
                toPartThickness: 1.5748,
                weldForce: 1477,
                weldTime: 18,
                holdTime: 20,
                weldCurrent: { 6: 10600, 12: 8480, 18: 6890 },
                openCircuitVoltage: 1.6
            },
            {
                id: 7,
                toPartThickness: 1.9812,
                weldForce: 1991,
                weldTime: 25,
                holdTime: 30,
                weldCurrent: { 6: 11800, 12: 9440, 18: 7670 },
                openCircuitVoltage: 1.6
            },
            {
                id: 8,
                toPartThickness: 2.3876,
                weldForce: 2557,
                weldTime: 34,
                holdTime: 35,
                weldCurrent: { 6: 13000, 12: 10400, 18: 8450 },
                openCircuitVoltage: 1.6
            },
            {
                id: 9,
                toPartThickness: 2.7686,
                weldForce: 3175,
                weldTime: 45,
                holdTime: 40,
                weldCurrent: { 6: 14200, 12: 11360, 18: 9230 },
                openCircuitVoltage: 1.6
            },
            {
                id: 10,
                toPartThickness: 3.175,
                weldForce: 3880,
                weldTime: 60,
                holdTime: 45,
                weldCurrent: { 6: 15600, 12: 12480, 18: 10140 },
                openCircuitVoltage: 1.6
            },
            {
                id: 11,
                toPartThickness: 3.9624,
                weldForce: 5512,
                weldTime: 93,
                holdTime: 50,
                weldCurrent: { 6: 18000, 12: 14400, 18: 11700 },
                openCircuitVoltage: 2.5
            },
            {
                id: 12,
                toPartThickness: 4.7498,
                weldForce: 7363,
                weldTime: 130,
                holdTime: 55,
                weldCurrent: { 6: 20500, 12: 16400, 18: 13325 },
                openCircuitVoltage: 2.5
            },
            {
                id: 13,
                toPartThickness: 6.35,
                weldForce: 12258,
                weldTime: 230,
                holdTime: 60,
                weldCurrent: { 6: 26000, 12: 20800, 18: 16900 },
                openCircuitVoltage: 3.55
            }
        ]
    }

    /**
     * Get disc brush diameter values
     */
    getDiscBrushDia() {
        return [
            {
                materialType: 'Aluminium',
                discBrush: 20,
                prepRPM: 2300,
                cleaningRPM: 1150,
                discSurfaceArea: 314,
                partArea: 2000
            },
            {
                materialType: 'Aluminium',
                discBrush: 50,
                prepRPM: 1955,
                cleaningRPM: 978,
                discSurfaceArea: 1963,
                partArea: 10000
            },
            {
                materialType: 'Aluminium',
                discBrush: 70,
                prepRPM: 1662,
                cleaningRPM: 831,
                discSurfaceArea: 3848,
                partArea: 20000
            },
            {
                materialType: 'Aluminium',
                discBrush: 100,
                prepRPM: 1412,
                cleaningRPM: 706,
                discSurfaceArea: 7458,
                partArea: 50000
            },
            {
                materialType: 'Aluminium',
                discBrush: 120,
                prepRPM: 1201,
                cleaningRPM: 600,
                discSurfaceArea: 11310,
                partArea: 100000
            },
            {
                materialType: 'Aluminium',
                discBrush: 144,
                prepRPM: 1021,
                cleaningRPM: 510,
                discSurfaceArea: 16286,
                partArea: 100001
            },

            {
                materialType: 'Carbon Steel',
                discBrush: 20,
                prepRPM: 1600,
                cleaningRPM: 800,
                discSurfaceArea: 314,
                partArea: 2000
            },
            {
                materialType: 'Carbon Steel',
                discBrush: 50,
                prepRPM: 1360,
                cleaningRPM: 680,
                discSurfaceArea: 1963,
                partArea: 10000
            },
            {
                materialType: 'Carbon Steel',
                discBrush: 70,
                prepRPM: 1156,
                cleaningRPM: 578,
                discSurfaceArea: 3848,
                partArea: 20000
            },
            {
                materialType: 'Carbon Steel',
                discBrush: 100,
                prepRPM: 983,
                cleaningRPM: 491,
                discSurfaceArea: 7458,
                partArea: 50000
            },
            {
                materialType: 'Carbon Steel',
                discBrush: 120,
                prepRPM: 835,
                cleaningRPM: 418,
                discSurfaceArea: 11310,
                partArea: 100000
            },
            {
                materialType: 'Carbon Steel',
                discBrush: 144,
                prepRPM: 710,
                cleaningRPM: 355,
                discSurfaceArea: 16286,
                partArea: 100001
            },

            {
                materialType: 'Stainless Steel',
                discBrush: 20,
                prepRPM: 1200,
                cleaningRPM: 600,
                discSurfaceArea: 314,
                partArea: 2000
            },
            {
                materialType: 'Stainless Steel',
                discBrush: 50,
                prepRPM: 1020,
                cleaningRPM: 510,
                discSurfaceArea: 1963,
                partArea: 10000
            },
            {
                materialType: 'Stainless Steel',
                discBrush: 70,
                prepRPM: 867,
                cleaningRPM: 434,
                discSurfaceArea: 3848,
                partArea: 20000
            },
            {
                materialType: 'Stainless Steel',
                discBrush: 100,
                prepRPM: 737,
                cleaningRPM: 368,
                discSurfaceArea: 7458,
                partArea: 50000
            },
            {
                materialType: 'Stainless Steel',
                discBrush: 120,
                prepRPM: 626,
                cleaningRPM: 313,
                discSurfaceArea: 11310,
                partArea: 100000
            },
            {
                materialType: 'Stainless Steel',
                discBrush: 144,
                prepRPM: 532,
                cleaningRPM: 266,
                discSurfaceArea: 16286,
                partArea: 100001
            },

            {
                materialType: 'Copper',
                discBrush: 20,
                prepRPM: 1020,
                cleaningRPM: 510,
                discSurfaceArea: 314,
                partArea: 2000
            },
            {
                materialType: 'Copper',
                discBrush: 50,
                prepRPM: 867,
                cleaningRPM: 434,
                discSurfaceArea: 1963,
                partArea: 10000
            },
            {
                materialType: 'Copper',
                discBrush: 70,
                prepRPM: 737,
                cleaningRPM: 368,
                discSurfaceArea: 3848,
                partArea: 20000
            },
            {
                materialType: 'Copper',
                discBrush: 100,
                prepRPM: 626,
                cleaningRPM: 313,
                discSurfaceArea: 7458,
                partArea: 50000
            },
            {
                materialType: 'Copper',
                discBrush: 120,
                prepRPM: 532,
                cleaningRPM: 266,
                discSurfaceArea: 11310,
                partArea: 100000
            },
            {
                materialType: 'Copper',
                discBrush: 144,
                prepRPM: 453,
                cleaningRPM: 226,
                discSurfaceArea: 16286,
                partArea: 100001
            }
        ]
    }
}
