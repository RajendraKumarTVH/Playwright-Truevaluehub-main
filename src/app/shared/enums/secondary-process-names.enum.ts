export enum SecondaryProcessNames {
  Plating = 1,
  PowderCoating = 2,
  Painting = 3,
  HeatTreatment = 4,
  ShotBlasting = 5,
  Deburring = 6,
  MIGWelding = 7,
  Other = 8,
}

export const SecondaryProcessNamesMap = new Map<number, string>([
  [SecondaryProcessNames.Plating, 'Plating'],
  [SecondaryProcessNames.PowderCoating, 'Powder Coating'],
  [SecondaryProcessNames.Painting, 'Painting'],
  [SecondaryProcessNames.HeatTreatment, 'Heat Treatment'],
  [SecondaryProcessNames.ShotBlasting, 'Shot Blasting'],
  [SecondaryProcessNames.Deburring, 'Deburring'],
  [SecondaryProcessNames.MIGWelding, 'MIG Welding'],
  [SecondaryProcessNames.Other, 'Other'],
]);
