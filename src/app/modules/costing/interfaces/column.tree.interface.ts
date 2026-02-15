export interface Column {
  field: string;
  header: string;
  minWidth?: string;
  cssClass?: string;
}
export interface CostGraphicalData {
  id: number;
  label: string;
  percent: number;
  color: string;
  offset: number;
}
