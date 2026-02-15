export interface PalletDimensionDto {
  palletLength: number;
  palletWidth: number;
  palletHeight: number;
}

export interface PartEnvelopDimensionDto {
  partEnvelopLength: number;
  partEnvelopWidth: number;
  partEnvelopHeight: number;
}

export interface CartonDimensionDto {
  cartonBoxLength: number;
  cartonBoxWidth: number;
  cartonBoxHeight: number;
}

export interface CartonCostRequestDto extends CartonDimensionDto, PartEnvelopDimensionDto {}

export interface PalletCostRequestDto extends CartonDimensionDto, PalletDimensionDto {
  partWeight: number;
}
