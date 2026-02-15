export interface DfSupplierPowerAssumptionInfo {
  coalCost?: number;
  windCost?: number;
  naturalGasCost?: number;
  nuclearCost?: number;
  geothermalCost?: number;
  otherNonRenewableCost?: number;
  otherRenewableCost?: number;
  coalPortion?: number;
  windPortion?: number;
  naturalGasPortion?: number;
  nuclearPortion?: number;
  geothermalPortion?: number;
  otherNonRenewablePortion?: number;
  otherRenewablePortion?: number;
  coalESG?: number;
  windESG?: number;
  naturalGasESG?: number;
  nuclearESG?: number;
  geothermalESG?: number;
  otherNonRenewableESG?: number;
  otherRenewableESG?: number;
}
