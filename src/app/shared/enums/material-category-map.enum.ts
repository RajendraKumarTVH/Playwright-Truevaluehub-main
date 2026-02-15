import { MaterialCategory } from './material-category.enum';
export const MaterialCategoryList = new Map<number, string>([
  [MaterialCategory.Other, 'Other'],
  // [MaterialCategory.Glass, 'Glass'],
  [MaterialCategory.Plastics, 'Plastics'],
  [MaterialCategory.Foam, 'Foam'],
  // [MaterialCategory.PlasticFilm, 'Plastic Film'],
  // [MaterialCategory.Chemicals, 'Chemicals'],
  [MaterialCategory.NonFerrous, 'Non Ferrous'],
  [MaterialCategory.PaintPowderGasSand, 'Paint/Powder/Gas/Sand'],
  // [MaterialCategory.Fabric, 'Fabric'],
  [MaterialCategory.Packaging, 'Packaging'],
  //  [MaterialCategory.PackagingConfig, 'Packaging Config'],
  [MaterialCategory.Ferrous, 'Ferrous'],
  [MaterialCategory.Rubber, 'Rubber'],
]);

export class SelectModel {
  id: number;
  name: string;
}
