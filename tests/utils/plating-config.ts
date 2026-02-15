
import { ProcessType, PrimaryProcessType } from './constants';

export const PlatingConfig = {
    siverOrGoldPlatingTankSizes: [
        { id: 1, name: 'Small', length: 890, width: 645, height: 600 },
        { id: 2, name: 'Medium', length: 1090, width: 710, height: 645 },
        { id: 3, name: 'Large', length: 1332, width: 1180, height: 770 },
    ],

    platingTankSizes: [
        { id: 1, name: 'Small', length: 1065, width: 585, height: 1000 },
        { id: 2, name: 'Medium', length: 1657, width: 1210, height: 1200 },
        { id: 3, name: 'Large', length: 2500, width: 1800, height: 2100 },
    ],

    feedRatelookupTable: [
        { family: 'Chromium', typicalFeedRateRatio: 7 },
        { family: 'Gold Electroplating', typicalFeedRateRatio: 3 },
        { family: 'Nickel & Nickel Alloy', typicalFeedRateRatio: 5 },
        { family: 'Silver & Sliver Alloy', typicalFeedRateRatio: 4 },
        { family: 'Tin', typicalFeedRateRatio: 5.5 },
        { family: 'Zinc', typicalFeedRateRatio: 5.5 },
        { family: 'Copper & Copper Alloy', typicalFeedRateRatio: 5 },
    ],

    getSilverOrGoldTankSize: (partVolume: number) => {
        const sizes = PlatingConfig.siverOrGoldPlatingTankSizes;
        return sizes.find((tank) => tank.length * tank.width * tank.height * 0.2 >= partVolume) || sizes[sizes.length - 1];
    },

    getPlatingTankSize: (partVolume: number) => {
        const sizes = PlatingConfig.platingTankSizes;
        return sizes.find((tank) => tank.length * tank.width * tank.height * 0.2 >= partVolume) || sizes[sizes.length - 1];
    },

    getFeedRate: (matFamily: string): number => {
        const row = PlatingConfig.feedRatelookupTable.find((item) => item.family.toLowerCase() === matFamily.toLowerCase());
        return row ? row.typicalFeedRateRatio : 0;
    },

    getProcessDefaults: (pType: number, subProcessTypeID: number) => {
        switch (pType) {
            case ProcessType.ChromePlating:
                return { processId: PrimaryProcessType.ChromePlating, yield: 35, electroStatic: 0.064, intensity: 60, qa: 0.5, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.NickelPlating:
                return { processId: 143, yield: 95, electroStatic: 1.04, intensity: 4, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.CopperPlating:
                return { processId: 354, yield: 60, electroStatic: 0.71, intensity: 3, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.R2RPlating:
                return { processId: 251, yield: 95, electroStatic: 1.04, intensity: 4, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.TinPlating:
                return { processId: 144, yield: 98, electroStatic: 1.107, intensity: 1, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.GoldPlating:
                return { processId: 156, yield: 75, electroStatic: 3.68, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.SilverPlating:
                return { processId: 157, yield: 75, electroStatic: 4.025, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.PowderCoating:
                return { processId: 46, yield: 0, electroStatic: 0, intensity: 0, qa: 0.5, machineSpeed: 0, skilledLabours: 0 };
            case ProcessType.Painting:
                return { processId: 42, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.5, machineSpeed: 1.52, skilledLabours: 0 };
            case ProcessType.Galvanization:
                return {
                    processId: 180,
                    yield: 85,
                    electroStatic: 1.04,
                    intensity: 2,
                    qa: 0.25,
                    machineSpeed: 0,
                    skilledLabours: 1,
                    utilisation: 15,
                    volumeOfBarrel: 6000 * 2400 * 1100,
                };
            case 178: // SiliconCoatingAuto
                return { processId: 178, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.5, machineSpeed: 2.5, skilledLabours: 0 };
            case 179: // SiliconCoatingSemi
            case 127: // WetPainting
                return { processId: 127, yield: 85, electroStatic: 1.04, intensity: 2, qa: subProcessTypeID === 2 ? 0.25 : 0.5, machineSpeed: 2.5, skilledLabours: 0 };
            default:
                return { processId: 130, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
        }
    },

    getPowderCoatingMachineSpeed: (eav: number, dimX: number): number => {
        if (eav <= 20000) {
            return dimX <= 500 ? 0.9 : dimX <= 1250 ? 0.7 : 0.5;
        } else if (eav <= 50000) {
            return dimX <= 500 ? 1.5 : dimX <= 1250 ? 1 : 0.9;
        } else if (eav <= 100000) {
            return dimX <= 500 ? 2.5 : dimX <= 1250 ? 1.5 : 1;
        } else {
            return dimX <= 500 ? 3 : dimX <= 1250 ? 2 : 1.5;
        }
    },

    getPowderCoatingLoadingTime: (partWeight: number): number => {
        const loadingTimeMap = [
            { threshold: 250, time: 8 },
            { threshold: 500, time: 10 },
            { threshold: 1000, time: 14 },
            { threshold: 3000, time: 20 },
            { threshold: 5000, time: 32 },
            { threshold: 7000, time: 48 },
            { threshold: 10000, time: 70 },
            { threshold: 15000, time: 80 },
            { threshold: 20000, time: 96 },
            { threshold: 30000, time: 150 },
            { threshold: 50000, time: 190 },
            { threshold: 100000, time: 500 },
            { threshold: 500000, time: 900 },
            { threshold: Infinity, time: 1400 },
        ];
        return loadingTimeMap.find((item) => partWeight < item.threshold)?.time ?? 0;
    },

    galvanizationCoatingTime: [
        { thickness: 80, cleaningPickling: 15, fluxing: 2, dipping: 6, coolingInspection: 10 },
        { thickness: 100, cleaningPickling: 15, fluxing: 2, dipping: 8, coolingInspection: 10 },
        { thickness: 120, cleaningPickling: 15, fluxing: 2, dipping: 10, coolingInspection: 10 },
    ]
};
