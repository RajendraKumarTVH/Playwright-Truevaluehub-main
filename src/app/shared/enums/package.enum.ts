export enum PackagingSize {
  Small = 1,
  Medium = 2,
  Large = 3,
  VeryLarge = 4,
}

export const PackagingSizeDisplay: Record<PackagingSize, string> = {
  [PackagingSize.Small]: 'Small',
  [PackagingSize.Medium]: 'Medium',
  [PackagingSize.Large]: 'Large',
  [PackagingSize.VeryLarge]: 'Very Large',
};

export enum MaterialFinish {
  Plain = 1,
  Wet = 2,
  HighPolish = 3,
}

export const MaterialFinishDisplay: Record<MaterialFinish, string> = {
  [MaterialFinish.Plain]: 'Plain',
  [MaterialFinish.Wet]: 'Wet',
  [MaterialFinish.HighPolish]: 'High Polish',
};

export enum FragileStatus {
  Fragile = 1,
  Standard = 2,
}

export const FragileStatusDisplay: Record<FragileStatus, string> = {
  [FragileStatus.Fragile]: 'Fragile',
  [FragileStatus.Standard]: 'Standard',
};

export enum Freight {
  LandOrAir = 1,
  Sea = 2,
}

export const FreightDisplay: Record<Freight, string> = {
  [Freight.LandOrAir]: 'Land / Air',
  [Freight.Sea]: 'Sea',
};

export enum Environmental {
  Reusable = 1,
  Disposable = 2,
}

export const EnvironmentalDisplay: Record<Environmental, string> = {
  [Environmental.Reusable]: 'Reusable',
  [Environmental.Disposable]: 'Disposable',
};

export enum PackagingType {
  Primary = 1,
  Secondary = 2,
  Tertiary = 3,
}

export const PackagingTypeDisplay: Record<PackagingType, string> = {
  [PackagingType.Primary]: 'Primary',
  [PackagingType.Secondary]: 'Secondary',
  [PackagingType.Tertiary]: 'Tertiary',
};

export enum PackagingUnit {
  Box = 1,
  Each = 2,
  Pallet = 3,
  PerBox = 4,
  Roll = 5,
  Wrap = 6,
  Fill = 7,
}

export const PackagingUnitDisplay: Record<PackagingUnit, string> = {
  [PackagingUnit.Box]: 'Box',
  [PackagingUnit.Each]: 'Each',
  [PackagingUnit.Pallet]: 'Pallet',
  [PackagingUnit.PerBox]: 'Per Box',
  [PackagingUnit.Roll]: 'Roll',
  [PackagingUnit.Wrap]: 'Wrap',
  [PackagingUnit.Fill]: 'Fill',
};
