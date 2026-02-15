export interface PartSizeConfig {
  size: string;
  sizeId: number;
  maxWeightKg: number;
  dimensions: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
  };
}

export const PartSizeConfigs: PartSizeConfig[] = [
  {
    size: 'Small',
    sizeId: 1,
    maxWeightKg: 14,
    dimensions: {
      lengthMm: 150,
      widthMm: 150,
      heightMm: 150,
    },
  },
  {
    size: 'Medium',
    sizeId: 2,
    maxWeightKg: 21,
    dimensions: {
      lengthMm: 300,
      widthMm: 300,
      heightMm: 300,
    },
  },
  {
    size: 'Large',
    sizeId: 3,
    maxWeightKg: 45,
    dimensions: {
      lengthMm: 600,
      widthMm: 450,
      heightMm: 450,
    },
  },
  {
    size: 'Very Large',
    sizeId: 4,
    maxWeightKg: 0, // You can set a default or null if unknown
    dimensions: {
      lengthMm: 0,
      widthMm: 0,
      heightMm: 0,
    },
  },
];
