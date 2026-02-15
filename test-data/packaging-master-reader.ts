
import * as XLSX from 'xlsx';
import * as path from 'path';
import { MaterialPriceDto } from '../tests/models/packaging-info.model';

export interface PackingMaterialMaster {
    PackingMaterialMasterId: number;
    PackingMaterialMasterName?: string;
    UnitId: number;
    PackagingFormId: number;
    WeightInGms: number;
    LaborTimeSec: number;
    ESGKGCo2: number;
    BasePrice?: number;
    BulkPrice?: number;
    LengthInMm?: number;
    WidthInMm?: number;
    HeightInMm?: number;
    MaxWeightInGms?: number;
    MaxVolumeInCm3?: number;
    [key: string]: any;
}

export interface PackingMtlTbl {
    ID: number;
    PackagingType: string;
    PackagingForm: string;
    Description: string;
    [key: string]: any;
}

export class PackagingMasterReader {
    private static instance: PackagingMasterReader;
    private packingMaterials: PackingMaterialMaster[] = [];
    private packingTypes: Map<number, PackingMtlTbl> = new Map();

    private constructor() {
        const filePath = path.resolve(__dirname, '../tests/Database/MasterDB.ods');
        try {
            const workbook = XLSX.readFile(filePath, { sheetRows: 0 });

            // Read PackingMtlTbl for types and descriptions
            const typeSheetName = 'PackingMtlTbl';
            if (workbook.Sheets[typeSheetName]) {
                const types = XLSX.utils.sheet_to_json<PackingMtlTbl>(workbook.Sheets[typeSheetName]);
                types.forEach(t => this.packingTypes.set(t.ID, t));
                console.log(`✅ Loaded ${types.length} packaging types from ${typeSheetName}`);
            }

            // Read PackingMaterialMaster for item details
            const masterSheetName = 'PackingMaterialMaster';
            if (workbook.Sheets[masterSheetName]) {
                this.packingMaterials = XLSX.utils.sheet_to_json<PackingMaterialMaster>(workbook.Sheets[masterSheetName]);
                console.log(`✅ Loaded ${this.packingMaterials.length} packaging materials from ${masterSheetName}`);
            }
        } catch (error) {
            console.error('❌ Error reading MasterDB.ods:', error);
        }
    }

    public static getInstance(): PackagingMasterReader {
        if (!PackagingMasterReader.instance) {
            PackagingMasterReader.instance = new PackagingMasterReader();
        }
        return PackagingMasterReader.instance;
    }

    public getPackingMaterialsByType(typeKeyword: string): MaterialPriceDto[] {
        return this.packingMaterials
            .filter(m => {
                const typeInfo = this.packingTypes.get(m.PackagingFormId);
                return typeInfo?.PackagingType?.toLowerCase().includes(typeKeyword.toLowerCase()) ||
                    typeInfo?.PackagingForm?.toLowerCase().includes(typeKeyword.toLowerCase());
            })
            .map(m => {
                const typeInfo = this.packingTypes.get(m.PackagingFormId);
                return {
                    materialMasterId: m.PackingMaterialMasterId,
                    materialDescription: `${typeInfo?.Description || ''} ${typeInfo?.PackagingForm || ''} ${m.LengthInMm || ''}x${m.WidthInMm || ''}x${m.HeightInMm || ''}`,
                    price: m.BulkPrice || m.BasePrice || 0,
                    materialTypeName: typeInfo?.PackagingType || 'Unknown',
                    esgImpactCO2Kg: m.ESGKGCo2 || 0
                };
            });
    }

    public getCorrugatedBoxes(): MaterialPriceDto[] {
        return this.getPackingMaterialsByType('box');
    }

    public getPallets(): MaterialPriceDto[] {
        return this.getPackingMaterialsByType('pallet');
    }

    public getProtectivePackaging(): MaterialPriceDto[] {
        return this.getPackingMaterialsByType('protect'); // 'Adnl.Protect.Pkgs' usually contains 'protect'
    }
}

export const packagingMasterReader = PackagingMasterReader.getInstance();
