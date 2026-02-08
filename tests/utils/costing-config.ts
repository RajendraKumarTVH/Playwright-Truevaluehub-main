/**
 * Costing Configuration Data for Playwright Tests
 * Static data extracted from Angular CostingConfig service
 */

import { ProcessType } from './constants';

/**
 * CostingConfig class - provides static configuration data
 * for welding, machining, and other manufacturing processes
 */
export class CostingConfig {

    // ==================== WELD TYPES ====================
    typeOfWeld() {
        return [
            { id: 1, name: 'Fillet Weld' },
            { id: 2, name: 'Lap Weld' },
            { id: 3, name: 'Butt Weld (Full Peneteration)' },
            { id: 4, name: 'Butt Weld (Partial Peneteration)' }
        ];
    }

    typeOfWelds() {
        return [
            { id: 1, name: 'Fillet' },
            { id: 2, name: 'Square' },
            { id: 3, name: 'Plug' },
            { id: 4, name: 'Bevel/Flare/ V Groove' },
            { id: 5, name: 'U/J Groove' }
        ];
    }

    weldPositionList() {
        return [
            { id: 1, name: 'Flat' },
            { id: 2, name: 'Horizontal' },
            { id: 3, name: 'Vertical' },
            { id: 4, name: 'OverHead' },
            { id: 6, name: 'Combination' }
        ];
    }

    // ==================== WELDING DEFAULT VALUES ====================
    weldingDefaultPercentage(processTypeId: number, partComplexity = 1, percentageType = 'yieldPercentage') {
        const vals: any[] = [
            { processTypeId: ProcessType.Sonicwelding, yieldPercentage: { 1: 98, 2: 97, 3: 96 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
            { processTypeId: ProcessType.TigWelding, yieldPercentage: { 1: 98, 2: 96, 3: 94 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
            { processTypeId: ProcessType.SpotWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
            { processTypeId: ProcessType.SeamWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
            { processTypeId: ProcessType.MigWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: ProcessType.StickWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: ProcessType.FrictionWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } }
        ];
        return vals.find((x) => x.processTypeId === processTypeId)?.[percentageType]?.[partComplexity] || vals[4]?.[percentageType]?.[partComplexity];
    }

    weldingPositionList(weldType = 'welding') {
        if (weldType === 'stickWelding') {
            return [
                { id: 1, name: '1G Manual', EffeciencyAuto: 75, EffeciencyManual: 75, EffeciencySemiAuto: 75 },
                { id: 2, name: '2G Manual', EffeciencyAuto: 65, EffeciencyManual: 65, EffeciencySemiAuto: 65 },
                { id: 3, name: '3G Manual', EffeciencyAuto: 60, EffeciencyManual: 60, EffeciencySemiAuto: 60 },
                { id: 4, name: '4G Manual', EffeciencyAuto: 50, EffeciencyManual: 50, EffeciencySemiAuto: 50 },
                { id: 5, name: '1G Robotic', EffeciencyAuto: 85, EffeciencyManual: 85, EffeciencySemiAuto: 85 },
                { id: 6, name: '2G Robotic', EffeciencyAuto: 75, EffeciencyManual: 75, EffeciencySemiAuto: 75 },
                { id: 7, name: '3G Robotic', EffeciencyAuto: 70, EffeciencyManual: 70, EffeciencySemiAuto: 70 },
                { id: 8, name: '4G Robotic', EffeciencyAuto: 60, EffeciencyManual: 60, EffeciencySemiAuto: 60 }
            ];
        }
        return [
            { id: 1, name: 'Flat', EffeciencyAuto: 80, EffeciencyManual: 70, EffeciencySemiAuto: 80 },
            { id: 2, name: 'Horizontal', EffeciencyAuto: 80, EffeciencyManual: 70, EffeciencySemiAuto: 80 },
            { id: 3, name: 'Vertical', EffeciencyAuto: 75, EffeciencyManual: 65, EffeciencySemiAuto: 75 },
            { id: 4, name: 'OverHead', EffeciencyAuto: 75, EffeciencyManual: 65, EffeciencySemiAuto: 75 }
        ];
    }

    // ==================== WELDING LOOKUP TABLES ====================
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
            { toLength: 1000000, noOfWeld: 85 }
        ];
        return weldList.find((x) => x.toLength >= len)?.noOfWeld || weldList[weldList.length - 1].noOfWeld;
    }

    weldPass(len: number, weldType = 'welding'): number {
        let weldList = [];
        if (weldType === 'stickWelding') {
            weldList = [
                { toWeldLegLength: 3, noOfWeldPasses: 1 },
                { toWeldLegLength: 6, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 3 }
            ];
        } else {
            weldList = [
                { toWeldLegLength: 8, noOfWeldPasses: 1 },
                { toWeldLegLength: 12, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 0 }
            ];
        }
        return weldList.find((x) => x.toWeldLegLength >= len)?.noOfWeldPasses || weldList[weldList.length - 1].noOfWeldPasses;
    }

    // ==================== WELDING MACHINE VALUES ====================
    weldingValuesForStickWelding() {
        return [
            { id: 1, ToPartThickness: 3.175, WireDiameter: 1.6, Current: 33, Voltage: 22.5, TravelSpeed: 1.25 },
            { id: 2, ToPartThickness: 4.7625, WireDiameter: 2.4, Current: 83, Voltage: 23.5, TravelSpeed: 1.5 },
            { id: 3, ToPartThickness: 6.35, WireDiameter: 3.2, Current: 120, Voltage: 23.5, TravelSpeed: 1.67 },
            { id: 4, ToPartThickness: 8, WireDiameter: 4, Current: 165, Voltage: 24, TravelSpeed: 1.88 },
            { id: 5, ToPartThickness: 9.525, WireDiameter: 4.8, Current: 208, Voltage: 25.5, TravelSpeed: 2 },
            { id: 6, ToPartThickness: 12.7, WireDiameter: 6.4, Current: 313, Voltage: 26.5, TravelSpeed: 2.17 },
            { id: 7, ToPartThickness: 10000, WireDiameter: 8, Current: 400, Voltage: 28, TravelSpeed: 2.5 }
        ];
    }

    weldingMachineValuesForSeamWelding() {
        return [
            { id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
            { id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
            { id: 3, machine: 'FN-160-H', weldingEfficiency: 31.05 },
            { id: 4, machine: 'FN-100-E', weldingEfficiency: 27.945 },
            { id: 5, machine: 'FN-160-E', weldingEfficiency: 25.1505 }
        ];
    }

    weldingValuesForMachineType() {
        return [
            { id: 1, FromPartThickness: 0, ToPartThickness: 1, WireDiameter: 0.8, Voltage: 15, Current: 65, WireFeed: 4, TravelSpeed: 8 },
            { id: 1, FromPartThickness: 1.1, ToPartThickness: 1.6, WireDiameter: 1, Voltage: 18, Current: 145, WireFeed: 5.5, TravelSpeed: 8.5 },
            { id: 1, FromPartThickness: 1.7, ToPartThickness: 3, WireDiameter: 1.2, Voltage: 18, Current: 140, WireFeed: 3.6, TravelSpeed: 6.5 },
            { id: 1, FromPartThickness: 3.1, ToPartThickness: 6, WireDiameter: 1.2, Voltage: 27, Current: 260, WireFeed: 7, TravelSpeed: 7.9 },
            { id: 1, FromPartThickness: 6.1, ToPartThickness: 10, WireDiameter: 1.2, Voltage: 27, Current: 290, WireFeed: 3.6, TravelSpeed: 7.4 },
            { id: 1, FromPartThickness: 10.1, ToPartThickness: 15, WireDiameter: 1.2, Voltage: 29.5, Current: 310, WireFeed: 11, TravelSpeed: 6.5 },
            { id: 1, FromPartThickness: 15.1, ToPartThickness: 100000, WireDiameter: 2, Voltage: 35, Current: 400, WireFeed: 12, TravelSpeed: 7.8 },
            { id: 3, FromPartThickness: 0, ToPartThickness: 1, WireDiameter: 0.8, Voltage: 15, Current: 65, WireFeed: 3, TravelSpeed: 6 },
            { id: 3, FromPartThickness: 1.1, ToPartThickness: 1.6, WireDiameter: 1, Voltage: 18, Current: 145, WireFeed: 4.125, TravelSpeed: 6.38 },
            { id: 3, FromPartThickness: 1.7, ToPartThickness: 3, WireDiameter: 1.2, Voltage: 18, Current: 140, WireFeed: 2.7, TravelSpeed: 4.88 },
            { id: 3, FromPartThickness: 3.1, ToPartThickness: 6, WireDiameter: 1.2, Voltage: 27, Current: 260, WireFeed: 5.25, TravelSpeed: 5.93 },
            { id: 3, FromPartThickness: 6.1, ToPartThickness: 10, WireDiameter: 1.2, Voltage: 27, Current: 290, WireFeed: 2.7, TravelSpeed: 5.55 },
            { id: 3, FromPartThickness: 10.1, ToPartThickness: 15, WireDiameter: 1.2, Voltage: 29.5, Current: 310, WireFeed: 8.25, TravelSpeed: 4.88 },
            { id: 3, FromPartThickness: 15.1, ToPartThickness: 100000, WireDiameter: 2, Voltage: 35, Current: 400, WireFeed: 9, TravelSpeed: 5.85 }
        ];
    }

    tigWeldingValuesForMachineType() {
        return [
            { id: 1, FromPartThickness: 0, ToPartThickness: 1.6, WireDiameter: 1.6, Voltage: 15, Current: 90, WireFeed: 4, TravelSpeed: 4 },
            { id: 1, FromPartThickness: 1.7, ToPartThickness: 3.2, WireDiameter: 2.4, Voltage: 18, Current: 130, WireFeed: 5.5, TravelSpeed: 4 },
            { id: 1, FromPartThickness: 3.3, ToPartThickness: 4.8, WireDiameter: 3.2, Voltage: 18, Current: 225, WireFeed: 3.6, TravelSpeed: 4 },
            { id: 1, FromPartThickness: 4.9, ToPartThickness: 100006.4, WireDiameter: 4.8, Voltage: 27, Current: 313, WireFeed: 7, TravelSpeed: 3 },
            { id: 3, FromPartThickness: 0, ToPartThickness: 1.6, WireDiameter: 1.6, Voltage: 15, Current: 90, WireFeed: 3, TravelSpeed: 3 },
            { id: 3, FromPartThickness: 1.7, ToPartThickness: 3.2, WireDiameter: 2.4, Voltage: 18, Current: 130, WireFeed: 4.125, TravelSpeed: 3 },
            { id: 3, FromPartThickness: 3.3, ToPartThickness: 4.8, WireDiameter: 3.2, Voltage: 18, Current: 225, WireFeed: 2.7, TravelSpeed: 3 },
            { id: 3, FromPartThickness: 4.9, ToPartThickness: 100006.4, WireDiameter: 4.8, Voltage: 27, Current: 312.5, WireFeed: 5.25, TravelSpeed: 3 }
        ];
    }

    spotWeldingValuesForMachineType() {
        return [
            { id: 1, toPartThickness: 0.254, weldForce: 353, weldTime: 4, holdTime: 5, weldCurrent: { 6: 4000, 12: 3200, 18: 2600 }, openCircuitVoltage: 1.6 },
            { id: 2, toPartThickness: 0.5334, weldForce: 538, weldTime: 6, holdTime: 8, weldCurrent: { 6: 6500, 12: 5200, 18: 4225 }, openCircuitVoltage: 1.6 },
            { id: 3, toPartThickness: 0.7874, weldForce: 719, weldTime: 8, holdTime: 10, weldCurrent: { 6: 8000, 12: 6400, 18: 5200 }, openCircuitVoltage: 1.6 },
            { id: 4, toPartThickness: 1.016, weldForce: 908, weldTime: 10, holdTime: 12, weldCurrent: { 6: 8800, 12: 7040, 18: 5720 }, openCircuitVoltage: 1.6 },
            { id: 5, toPartThickness: 1.27, weldForce: 1221, weldTime: 14, holdTime: 16, weldCurrent: { 6: 9600, 12: 7680, 18: 6240 }, openCircuitVoltage: 1.6 },
            { id: 6, toPartThickness: 1.5748, weldForce: 1477, weldTime: 18, holdTime: 20, weldCurrent: { 6: 10600, 12: 8480, 18: 6890 }, openCircuitVoltage: 1.6 },
            { id: 7, toPartThickness: 1.9812, weldForce: 1991, weldTime: 25, holdTime: 30, weldCurrent: { 6: 11800, 12: 9440, 18: 7670 }, openCircuitVoltage: 1.6 },
            { id: 8, toPartThickness: 2.3876, weldForce: 2557, weldTime: 34, holdTime: 35, weldCurrent: { 6: 13000, 12: 10400, 18: 8450 }, openCircuitVoltage: 1.6 },
            { id: 9, toPartThickness: 2.7686, weldForce: 3175, weldTime: 45, holdTime: 40, weldCurrent: { 6: 14200, 12: 11360, 18: 9230 }, openCircuitVoltage: 1.6 },
            { id: 10, toPartThickness: 3.175, weldForce: 3880, weldTime: 60, holdTime: 45, weldCurrent: { 6: 15600, 12: 12480, 18: 10140 }, openCircuitVoltage: 1.6 },
            { id: 11, toPartThickness: 3.9624, weldForce: 5512, weldTime: 93, holdTime: 50, weldCurrent: { 6: 18000, 12: 14400, 18: 11700 }, openCircuitVoltage: 2.5 },
            { id: 12, toPartThickness: 4.7498, weldForce: 7363, weldTime: 130, holdTime: 55, weldCurrent: { 6: 20500, 12: 16400, 18: 13325 }, openCircuitVoltage: 2.5 },
            { id: 13, toPartThickness: 6.35, weldForce: 12258, weldTime: 230, holdTime: 60, weldCurrent: { 6: 26000, 12: 20800, 18: 16900 }, openCircuitVoltage: 3.55 }
        ];
    }

    weldingValuesForPartHandling(weldType = 'welding') {
        if (weldType === 'spotWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 2, unloading: 2 },
                { id: 2, toPartWeight: 4, loading: 5, unloading: 5 },
                { id: 3, toPartWeight: 10, loading: 10, unloading: 10 },
                { id: 4, toPartWeight: 25, loading: 20, unloading: 20 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
            ];
        } else if (weldType === 'seamWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 8, unloading: 8 },
                { id: 2, toPartWeight: 5, loading: 16, unloading: 16 },
                { id: 3, toPartWeight: 10, loading: 24, unloading: 24 },
                { id: 4, toPartWeight: 20, loading: 32, unloading: 32 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
            ];
        } else if (weldType === 'stickWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 10, unloading: 10 },
                { id: 2, toPartWeight: 4, loading: 30, unloading: 30 },
                { id: 3, toPartWeight: 10, loading: 60, unloading: 60 },
                { id: 4, toPartWeight: 25, loading: 90, unloading: 90 },
                { id: 5, toPartWeight: 10000, loading: 180, unloading: 180 }
            ];
        }
        return [];
    }

    // ==================== MATERIAL BASE TYPES ====================
    typeOfMaterialBase() {
        return [
            { id: 1, name: 'Carbon Steel' },
            { id: 2, name: 'SS 301 to 308' },
            { id: 3, name: 'SS316' }
        ];
    }

    // ==================== STOCK FORMS ====================
    getStockForms() {
        return [
            { id: 1, name: 'Film' },
            { id: 4, name: 'Sheet' },
            { id: 11, name: 'Bar' },
            { id: 19, name: 'Billet' },
            { id: 22, name: 'Wire' },
            { id: 23, name: 'Granules' },
            { id: 25, name: 'Rod' },
            { id: 29, name: 'Coil' },
            { id: 43, name: 'Round Bar' },
            { id: 44, name: 'Square Bar' },
            { id: 45, name: 'Tube' },
            { id: 47, name: 'Plate' },
            { id: 56, name: 'Pipe' }
        ];
    }

    // ==================== UNIT OF MEASURE ====================
    getUnitOfMeasure() {
        return [
            { id: 1, convertionValue: 'mm' },
            { id: 2, convertionValue: 'inches' },
            { id: 3, convertionValue: 'cm' },
            { id: 4, convertionValue: 'm' },
            { id: 5, convertionValue: 'feet' }
        ];
    }

    // ==================== CAVITY CALCULATIONS ====================
    cavityColsRows(cavities: number) {
        const options = [
            { id: 1, noCavities: 1, columns: 1, rows: 1 },
            { id: 2, noCavities: 2, columns: 2, rows: 1 },
            { id: 4, noCavities: 4, columns: 2, rows: 2 },
            { id: 6, noCavities: 6, columns: 3, rows: 2 },
            { id: 8, noCavities: 8, columns: 4, rows: 2 },
            { id: 16, noCavities: 16, columns: 4, rows: 4 },
            { id: 12, noCavities: 12, columns: 6, rows: 2 },
            { id: 32, noCavities: 32, columns: 8, rows: 4 },
            { id: 64, noCavities: 64, columns: 8, rows: 8 }
        ];
        return options.find((x) => x.noCavities === cavities) || {
            id: cavities,
            noCavities: cavities,
            columns: Math.round(cavities / 2),
            rows: Math.round(cavities / Math.round(cavities / 2))
        };
    }

    // ==================== PART FAMILY LIST ====================
    getPartFamilyList() {
        return [
            { id: 1, name: 'Wire' },
            { id: 2, name: 'Terminal' },
            { id: 3, name: 'Connector' },
            { id: 4, name: 'Tape' },
            { id: 5, name: 'Clamp' },
            { id: 6, name: 'Clip/Tie' },
            { id: 7, name: 'Splice' },
            { id: 8, name: 'Shrink Tube' },
            { id: 9, name: 'Tube' },
            { id: 10, name: 'Seal' },
            { id: 11, name: 'Grommet' },
            { id: 12, name: 'Fuse' },
            { id: 13, name: 'Inline Fuse Holder' },
            { id: 14, name: 'Adaptor' },
            { id: 15, name: 'Label' },
            { id: 16, name: 'Caps' },
            { id: 17, name: 'Relay' },
            { id: 18, name: 'Diode' },
            { id: 19, name: 'Secondary Locks' },
            { id: 20, name: 'Sleeves' },
            { id: 21, name: 'Spiral Wraps' },
            { id: 22, name: 'Others' }
        ];
    }

    // ==================== DISC BRUSH DATA ====================
    getDiscBrushDia() {
        return [
            { materialType: 'Aluminium', partArea: 0, discBrush: 6, prepRPM: 3500, cleaningRPM: 3500 },
            { materialType: 'Steel', partArea: 0, discBrush: 6, prepRPM: 3500, cleaningRPM: 3500 }
        ];
    }
}

// Export singleton instance
export const costingConfig = new CostingConfig();
