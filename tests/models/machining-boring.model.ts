export class BoringDto {
  materialTypeId: number;
  cuttingSpeed: number;
  feedPerRev: number;
  depthOfCut: number;
}

export class Boring {
  boringLookupId: number;
  materialTypeId: number;
  boringRoughingCS: number;
  boringFinishingCS: number;
  taperBoringRoughingCS: number;
  taperBoringFinishingCS: number;
  boringRoughingFeed: number;
  boringFinishingFeed: number;
  taperBoringRoughingFeed: number;
  taperBoringFinishingFeed: number;
  boringRoughingDepth: number;
  boringFinishingDepth: number;
  taperBoringRoughingDepth: number;
  taperBoringFinishingDepth: number;
}
