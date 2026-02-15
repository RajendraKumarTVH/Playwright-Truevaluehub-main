
import * as XLSX from 'xlsx';
import * as path from 'path';

export interface MachineMasterData {
    MachineID: number;
    MachineName: string;
    TotalPowerKW: number;
    PowerUtilization: number;
    MachineTonnageTons: number;
    MachineCategory: string;
    MachineDescription?: string;
    InjectionRate?: number;
    ShotSize?: number;
    PlatenLengthmm?: number;
    PlatenWidthmm?: number;
    [key: string]: any;
}

export class MachineMasterReader {
    private static instance: MachineMasterReader;
    private data: MachineMasterData[] = [];

    private constructor() {
        const filePath = path.resolve(__dirname, './MasterDB.ods');
        try {
            // Read with sheetRows: 0 to load ALL rows (default is 200)
            const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
            const sheetName = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            this.data = XLSX.utils.sheet_to_json<MachineMasterData>(worksheet);
            console.log(`✅ Loaded ${this.data.length} machines from MasterDB.ods (Sheet: ${sheetName}) - Expected: 2135`);
        } catch (error) {
            console.error('❌ Error reading MachineMater.ods:', error);
        }
    }

    public static getInstance(): MachineMasterReader {
        if (!MachineMasterReader.instance) {
            MachineMasterReader.instance = new MachineMasterReader();
        }
        return MachineMasterReader.instance;
    }

    public getMachineByTonnage(tonnage: number): MachineMasterData | undefined {
        // Find the machine with the closest tonnage, or exact match
        // Filter for machines that have a valid tonnage
        const validMachines = this.data.filter(m => (m.MachineTonnageTons || 0) > 0);

        // Sort by difference from target tonnage
        validMachines.sort((a, b) => Math.abs((a.MachineTonnageTons || 0) - tonnage) - Math.abs((b.MachineTonnageTons || 0) - tonnage));

        const bestMatch = validMachines[0];
        if (bestMatch) {
            console.log(`✅ Machine match found: ${bestMatch.MachineName} (Tonnage: ${bestMatch.MachineTonnageTons}) for target ${tonnage}`);
            return bestMatch;
        }

        return undefined;
    }

    public getMachineByName(name: string): MachineMasterData | undefined {
        if (!name) return undefined;
        const normName = name.toLowerCase().trim();
        const match = this.data.find(m => m.MachineName?.toLowerCase().trim() === normName);
        if (match) {
            console.log(`✅ Machine match found by name: ${match.MachineName}`);
        }
        return match;
    }

    public getMachineByDescription(description: string): MachineMasterData | undefined {
        if (!description) return undefined;
        const normDesc = description.toLowerCase().trim();
        const match = this.data.find(m => m.MachineDescription?.toLowerCase().trim() === normDesc);
        if (match) {
            console.log(`✅ Machine match found by description: ${match.MachineDescription}`);
        }
        return match;
    }

    public getMachineById(id: number): MachineMasterData | undefined {
        const match = this.data.find(m => m.MachineID === id);
        if (match) {
            console.log(`✅ Machine match found by ID: ${match.MachineID} (${match.MachineName})`);
        }
        return match;
    }

    public getMachineByMultipleCriteria(criteria: { tonnage?: number, category?: string }): MachineMasterData | undefined {
        let candidates = this.data;

        if (criteria.category) {
            const normCat = criteria.category.toLowerCase().trim();
            candidates = candidates.filter(m => m.MachineCategory?.toLowerCase().trim() === normCat);
        }

        if (criteria.tonnage) {
            candidates.sort((a, b) => Math.abs((a.MachineTonnageTons || 0) - criteria.tonnage!) - Math.abs((b.MachineTonnageTons || 0) - criteria.tonnage!));
        }

        const match = candidates[0];
        if (match) {
            console.log(`✅ Machine match found: ${match.MachineName}`);
            return match;
        }
        return undefined;
    }
}

export const machineMasterReader = MachineMasterReader.getInstance();
