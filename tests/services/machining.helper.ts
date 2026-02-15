
import { SharedService } from './shared';

export class MachiningHelperService {
  constructor(private sharedService: SharedService) { }

  getReorderedFeatures(featureData, inputCentroid, condition = 'greater'): any[] {
    const inputValues = this.sharedService.parseVector(inputCentroid);
    const maxValue = Math.max(...inputValues);
    const maxIndex = inputValues.indexOf(maxValue);

    const featureResult = [];
    featureData.forEach((group) => {
      featureResult.push({ ...group, subGroups: [] });
      group.subGroups?.forEach((subGroup: any) => {
        const centroidParam = subGroup.parameters?.find((p: any) => p.name === 'Centroid');
        if (!centroidParam) return;

        const centroidValues = this.sharedService.parseVector(centroidParam.value);
        const shouldAdd = condition === 'greater' ? centroidValues[maxIndex] >= maxValue : centroidValues[maxIndex] < maxValue;
        if (centroidValues[maxIndex] !== undefined && shouldAdd) {
          featureResult[featureResult.length - 1].subGroups.push(subGroup);
        }
      });
      featureResult[featureResult.length - 1].subGroups.length <= 0 && featureResult.pop();
    });

    return featureResult;
  }
}
