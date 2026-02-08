
import { WeldingCalculator, ProcessType, PartComplexity, PrimaryProcessType } from './tests/utils/welding-calculator';

const calculator = new WeldingCalculator();

const migInput: any = {
    processTypeID: ProcessType.MigWelding,
    partComplexity: PartComplexity.Low,
    semiAutoOrAuto: 2,
    weldingPosition: 1,
    efficiency: 0.7,
    lotSize: 1,
    setUpTime: 30,
    machineHourRate: 1.1905,
    marketingRate: 0,
    lowSkilledLaborRatePerHour: 42.7557,
    noOfLowSkilledLabours: 1,
    skilledLaborRatePerHour: 34.1925,
    noOfSkilledLabours: 0,
    inspectionTime: 2,
    qaOfInspectorRate: 29.9182,
    qaOfInspector: 1,
    samplingRate: 5,
    yieldPer: 97,
    requiredCurrent: 400,
    requiredWeldingVoltage: 35,
    electricityUnitCost: 0.141,
    powerConsumption: 14,
    machineMaster: {
        machineMarketDtos: [{ specialSkilledLabours: 1 }],
        machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)'
    },
    materialInfoList: [
        {
            processId: PrimaryProcessType.MigWelding,
            netMatCost: 0,
            netWeight: 0,
            dimX: 0,
            partTickness: 5,
            materialMasterData: {
                materialType: { materialTypeName: 'Steel' }
            }
        }
    ],
    subProcessFormArray: {
        controls: [
            {
                value: {
                    shoulderWidth: 6,
                    formHeight: 3.825,
                    formLength: 200,
                    noOfHoles: 1,
                    hlFactor: 1,
                    formPerimeter: 2,
                    lengthOfCut: 1
                }
            },
            {
                value: {
                    formLength: 100,
                    formHeight: 3.825,
                    hlFactor: 1,
                    formPerimeter: 1,
                    lengthOfCut: 1
                }
            }
        ]
    }
};

const fieldColorsList = [
    { formControlName: 'formHeight', subProcessIndex: 0, isDirty: true },
    { formControlName: 'formHeight', subProcessIndex: 1, isDirty: true }
]

const laborRateDto: any[] = [{ powerCost: 0.141 }]

const migResult = calculator.calculationForWelding(
    migInput,
    fieldColorsList,
    migInput,
    laborRateDto
);

console.log('Cycle Time:', migResult.cycleTime);
console.log('Efficiency:', migResult.efficiency);
console.log('Direct Labor Cost:', migResult.directLaborCost);
console.log('Direct SetUp Cost:', migResult.directSetUpCost);
console.log('Inspection Cost:', migResult.inspectionCost);
console.log('Direct Machine Cost:', migResult.directMachineCost);
console.log('Total Power Cost:', migResult.totalPowerCost);
console.log('Yield Cost:', migResult.yieldCost);
console.log('Direct Process Cost:', migResult.directProcessCost);
