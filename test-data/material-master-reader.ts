
import * as XLSX from 'xlsx';
import * as path from 'path';

export interface MaterialMasterData {
    MaterialMasterId: number;
    OriginCountryId: number;
    MaterialGroup: string;
    MaterialType: string;
    StockForm: string;
    MaterialDescription: string;
    Density: number;
    ThermalDiffusivity: number;
    ThermalConductivity?: number;
    MaterialSpecificHeat?: number;
    EjectDeflectionTemp: number;
    MeltingTemp: number;
    MoldTemp: number;
    ClampingPressure?: number;
    TensileStrength?: number;
    InjectionRate?: number;
    [key: string]: any;
}

export interface MaterialLookupCriteria {
    materialGroup?: string;
    materialType?: string;
    stockForm?: string;
    materialDescription?: string;
}

export class MaterialMasterReader {
    private static instance: MaterialMasterReader;
    private data: MaterialMasterData[] = [];

    private constructor() {
        const filePath = path.resolve(__dirname, './MasterDB.ods');
        try {
            // Read with sheetRows: 0 to load ALL rows (default is 200)
            const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
            const sheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'materialmaster') || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            this.data = XLSX.utils.sheet_to_json<MaterialMasterData>(worksheet);
            console.log(`✅ Loaded ${this.data.length} materials from MasterDB.ods (Sheet: ${sheetName})`);
        } catch (error) {
            console.error('❌ Error reading MaterialMaster.ods:', error);
        }
    }

    public static getInstance(): MaterialMasterReader {
        if (!MaterialMasterReader.instance) {
            MaterialMasterReader.instance = new MaterialMasterReader();
        }
        return MaterialMasterReader.instance;
    }

    /**
     * Legacy method - searches by MaterialType or MaterialGroup only
     * @deprecated Use getMaterialByMultipleFields for better accuracy
     */
    public getMaterialByDescription(description: string): MaterialMasterData | undefined {
        return this.data.find(m =>
            m.MaterialType?.toLowerCase().trim() === description.toLowerCase().trim() ||
            m.MaterialGroup?.toLowerCase().trim() === description.toLowerCase().trim()
        );
    }

    /**
     * Enhanced material lookup using multiple fields for better accuracy
     * Priority: Exact match on all fields > Partial match > Fallback to description only
     */
    public getMaterialByMultipleFields(criteria: MaterialLookupCriteria): MaterialMasterData | undefined {
        const normalize = (str?: any) => String(str || '').toLowerCase().trim();

        const {
            materialGroup = '',
            materialType = '',
            stockForm = '',
            materialDescription = ''
        } = criteria;

        // Normalize all criteria
        const normGroup = normalize(materialGroup);
        const normType = normalize(materialType);
        const normStock = normalize(stockForm);
        const normDesc = normalize(materialDescription);

        // 🔹 Strategy 1: Exact match on all provided fields
        if (normType || normGroup || normStock || normDesc) {
            const exactMatch = this.data.find(m => {
                const matchGroup = !normGroup || normalize(m.MaterialGroup) === normGroup;
                const matchType = !normType || normalize(m.MaterialType) === normType;
                const matchStock = !normStock || normalize(m.StockForm) === normStock;
                const matchDesc = !normDesc || normalize(m.MaterialDescription) === normDesc;

                return matchGroup && matchType && matchStock && matchDesc;
            });

            if (exactMatch) {
                console.log(`✅ Exact match found: ${exactMatch.MaterialType} (Group: ${exactMatch.MaterialGroup}, Stock: ${exactMatch.StockForm})`);
                return exactMatch;
            }
        }

        // 🔹 Strategy 2: Match MaterialType + MaterialGroup (most common case)
        if (normType && normGroup) {
            const typeGroupMatch = this.data.find(m =>
                normalize(m.MaterialType) === normType &&
                normalize(m.MaterialGroup) === normGroup
            );

            if (typeGroupMatch) {
                console.log(`✅ Type+Group match found: ${typeGroupMatch.MaterialType} (${typeGroupMatch.MaterialGroup})`);
                return typeGroupMatch;
            }
        }

        // 🔹 Strategy 3: Match MaterialType only
        if (normType) {
            const typeMatch = this.data.find(m => normalize(m.MaterialType) === normType);
            if (typeMatch) {
                console.log(`⚠️ Type-only match found: ${typeMatch.MaterialType}`);
                return typeMatch;
            }
        }

        // 🔹 Strategy 4: Match MaterialDescription
        if (normDesc) {
            const descMatch = this.data.find(m => normalize(m.MaterialDescription) === normDesc);
            if (descMatch) {
                console.log(`⚠️ Description-only match found: ${descMatch.MaterialDescription}`);
                return descMatch;
            }
        }

        // 🔹 Strategy 5: Fallback to MaterialGroup
        if (normGroup) {
            const groupMatch = this.data.find(m => normalize(m.MaterialGroup) === normGroup);
            if (groupMatch) {
                console.log(`⚠️ Group-only match found: ${groupMatch.MaterialGroup}`);
                return groupMatch;
            }
        }

        console.warn(`❌ No match found for criteria:`, criteria);
        return undefined;
    }

    /**
     * Get all materials matching the criteria (for debugging/analysis)
     */
    public getAllMatchingMaterials(criteria: MaterialLookupCriteria): MaterialMasterData[] {
        const normalize = (str?: string) => str?.toLowerCase().trim() || '';

        return this.data.filter(m => {
            const matchGroup = !criteria.materialGroup || normalize(m.MaterialGroup) === normalize(criteria.materialGroup);
            const matchType = !criteria.materialType || normalize(m.MaterialType) === normalize(criteria.materialType);
            const matchStock = !criteria.stockForm || normalize(m.StockForm) === normalize(criteria.stockForm);
            const matchDesc = !criteria.materialDescription || normalize(m.MaterialDescription) === normalize(criteria.materialDescription);

            return matchGroup && matchType && matchStock && matchDesc;
        });
    }
}

export const materialMasterReader = MaterialMasterReader.getInstance();
