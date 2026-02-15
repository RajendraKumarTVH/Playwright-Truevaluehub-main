
import { SharedService } from './shared';
import { SubProcessType } from '../utils/constants';

export class MaterialCastingMappingService {
    public defaultNetWeightPercentage = 5;
    public defaultRunnerRiserPercentage = 60;
    public defaultOxidationLossWeightPercentage = 6;
    public defaultSandRecoveryPercentage = 2;

    constructor(
        public sharedService: SharedService
    ) { }

    setSecondaryProcessTypeFlags(secondaryProcessId: number) {
        return {
            IsProcessTypePouring: secondaryProcessId === SubProcessType.MetalForPouring,
            IsProcessTypeSandForCore: secondaryProcessId === SubProcessType.SandForCore,
            IsProcessTypeSandForMold: secondaryProcessId === SubProcessType.SandForMold,
            IsProcessTypePatternWax: secondaryProcessId === SubProcessType.PatternWax,
            IsProcessTypeSlurryCost: secondaryProcessId === SubProcessType.SlurryCost,
            IsProcessTypeZirconSand: secondaryProcessId === SubProcessType.ZirconSand,
        };
    }
}
