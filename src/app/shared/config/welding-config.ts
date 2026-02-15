import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { PrimaryProcessType, ProcessType } from 'src/app/modules/costing/costing.config';
import { PartComplexity } from '../enums';
@Injectable({
  providedIn: 'root',
})
export class WeldingConfigService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getDiscBrushDia() {
    let list: any[] = [];
    list = [
      { materialType: 'Aluminium', discBrush: 20, prepRPM: 2300, cleaningRPM: 1150, discSurfaceArea: 314, partArea: 2000 },
      { materialType: 'Aluminium', discBrush: 50, prepRPM: 1955, cleaningRPM: 978, discSurfaceArea: 1963, partArea: 10000 },
      { materialType: 'Aluminium', discBrush: 70, prepRPM: 1662, cleaningRPM: 831, discSurfaceArea: 3848, partArea: 20000 },
      { materialType: 'Aluminium', discBrush: 100, prepRPM: 1412, cleaningRPM: 706, discSurfaceArea: 7458, partArea: 50000 },
      { materialType: 'Aluminium', discBrush: 120, prepRPM: 1201, cleaningRPM: 600, discSurfaceArea: 11310, partArea: 100000 },
      { materialType: 'Aluminium', discBrush: 144, prepRPM: 1021, cleaningRPM: 510, discSurfaceArea: 16286, partArea: 100001 },

      { materialType: 'Carbon Steel', discBrush: 20, prepRPM: 1600, cleaningRPM: 800, discSurfaceArea: 314, partArea: 2000 },
      { materialType: 'Carbon Steel', discBrush: 50, prepRPM: 1360, cleaningRPM: 680, discSurfaceArea: 1963, partArea: 10000 },
      { materialType: 'Carbon Steel', discBrush: 70, prepRPM: 1156, cleaningRPM: 578, discSurfaceArea: 3848, partArea: 20000 },
      { materialType: 'Carbon Steel', discBrush: 100, prepRPM: 983, cleaningRPM: 491, discSurfaceArea: 7458, partArea: 50000 },
      { materialType: 'Carbon Steel', discBrush: 120, prepRPM: 835, cleaningRPM: 418, discSurfaceArea: 11310, partArea: 100000 },
      { materialType: 'Carbon Steel', discBrush: 144, prepRPM: 710, cleaningRPM: 355, discSurfaceArea: 16286, partArea: 100001 },

      { materialType: 'Stainless Steel', discBrush: 20, prepRPM: 1200, cleaningRPM: 600, discSurfaceArea: 314, partArea: 2000 },
      { materialType: 'Stainless Steel', discBrush: 50, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 1963, partArea: 10000 },
      { materialType: 'Stainless Steel', discBrush: 70, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 3848, partArea: 20000 },
      { materialType: 'Stainless Steel', discBrush: 100, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 7458, partArea: 50000 },
      { materialType: 'Stainless Steel', discBrush: 120, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 11310, partArea: 100000 },
      { materialType: 'Stainless Steel', discBrush: 144, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 16286, partArea: 100001 },

      { materialType: 'Copper', discBrush: 20, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 314, partArea: 2000 },
      { materialType: 'Copper', discBrush: 50, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 1963, partArea: 10000 },
      { materialType: 'Copper', discBrush: 70, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 3848, partArea: 20000 },
      { materialType: 'Copper', discBrush: 100, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 7458, partArea: 50000 },
      { materialType: 'Copper', discBrush: 120, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 11310, partArea: 100000 },
      { materialType: 'Copper', discBrush: 144, prepRPM: 453, cleaningRPM: 226, discSurfaceArea: 16286, partArea: 100001 },
    ];

    return list;
  }

  weldingSubMaterialFormGroup(selectedMaterialInfoId = 0, coreData: any = null) {
    if (coreData) {
      return this.formbuilder.group(coreData);
    }
    return this.formbuilder.group({
      coreCostDetailsId: 0,
      materialInfoId: selectedMaterialInfoId || 0,
      coreLength: 0,
      coreWidth: 0,
      coreHeight: 0,
      coreShape: 1,
      coreArea: 1,
      coreVolume: 0,
      noOfCore: 1,
      coreWeight: 0,
      weldSide: 0,
      coreSandPrice: 0,
      grindFlush: 0,
    });
  }

  migWeldingData = [
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 6.97 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 1.6, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 6.06 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 5.27 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 27, Current_Amps: 260, WireFeed_m_per_min: 5.25, TravelSpeed_mm_per_sec: 4.58 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 4.17 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 4.75 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 4.5 },
    { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 3.58 },

    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 6.97 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 1.6, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 6.06 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 5.27 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 27, Current_Amps: 260, WireFeed_m_per_min: 5.25, TravelSpeed_mm_per_sec: 4.58 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 4.17 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 4.75 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 4.5 },
    { MaterialType: 'Galvanized Steel', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 3.58 },

    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 6.97 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 1.6, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 6.06 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 5.27 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 27, Current_Amps: 260, WireFeed_m_per_min: 5.25, TravelSpeed_mm_per_sec: 4.58 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 4.17 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 4.75 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 4.5 },
    { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 3.58 },
  ];

  getMaxNearestWeightLoss(materialType: string, wireDiameter: number) {
    const weightLossData = [
      { MaterialType: 'Carbon Steel', WireDiameter_mm: 0.8, loss_g: 0.158 },
      { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.0, loss_g: 0.246 },
      { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.2, loss_g: 0.355 },
      { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.6, loss_g: 0.631 },
      { MaterialType: 'Carbon Steel', WireDiameter_mm: 2.0, loss_g: 1.005 },
      { MaterialType: 'Stainless Steel', WireDiameter_mm: 0.8, loss_g: 0.16 },
      { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.0, loss_g: 0.252 },
      { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.2, loss_g: 0.369 },
      { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.6, loss_g: 0.665 },
      { MaterialType: 'Stainless Steel', WireDiameter_mm: 2.0, loss_g: 1.061 },
      { MaterialType: 'Aluminium', WireDiameter_mm: 0.8, loss_g: 0.054 },
      { MaterialType: 'Aluminium', WireDiameter_mm: 1.0, loss_g: 0.085 },
      { MaterialType: 'Aluminium', WireDiameter_mm: 1.2, loss_g: 0.122 },
      { MaterialType: 'Aluminium', WireDiameter_mm: 1.6, loss_g: 0.217 },
      { MaterialType: 'Aluminium', WireDiameter_mm: 2.0, loss_g: 0.326 },
      { MaterialType: 'Copper Alloy', WireDiameter_mm: 0.8, loss_g: 0.18 },
      { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.0, loss_g: 0.281 },
      { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.2, loss_g: 0.405 },
      { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.6, loss_g: 0.719 },
      { MaterialType: 'Copper Alloy', WireDiameter_mm: 2.0, loss_g: 1.12 },
    ];

    const filtered = weightLossData.filter((item) => item.MaterialType === materialType && item.WireDiameter_mm >= wireDiameter).sort((a, b) => a.WireDiameter_mm - b.WireDiameter_mm);

    return filtered.length > 0 ? filtered[0].loss_g : 0;
  }

  tigWeldingData = [
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 1,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 15,
      Current_Amps: 65,
      WireFeed_m_per_min: 3,
      TravelSpeed_mm_per_sec: 5.58,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 1.6,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 145,
      WireFeed_m_per_min: 4.125,
      TravelSpeed_mm_per_sec: 4.85,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 140,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 4.22,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 27,
      Current_Amps: 260,
      WireFeed_m_per_min: 5.25,
      TravelSpeed_mm_per_sec: 3.67,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 4,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 27,
      Current_Amps: 290,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 3.12,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 5,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 29.5,
      Current_Amps: 310,
      WireFeed_m_per_min: 8.25,
      TravelSpeed_mm_per_sec: 3.3,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 6,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 2.94,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 8,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 1.91,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 10,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 8,
      TravelSpeed_mm_per_sec: 1.47,
    },
    {
      MaterialType: 'Aluminium',
      Type: 'Manual',
      PlateThickness_mm: 12,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 6,
      TravelSpeed_mm_per_sec: 0.95,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: '<=1',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 15,
      Current_Amps: 65,
      WireFeed_m_per_min: 3,
      TravelSpeed_mm_per_sec: 4.74,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: '>1 <=1.6',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 145,
      WireFeed_m_per_min: 4.125,
      TravelSpeed_mm_per_sec: 4.12,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: '>1.6 <3',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 140,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 3.59,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 27,
      Current_Amps: 260,
      WireFeed_m_per_min: 5.25,
      TravelSpeed_mm_per_sec: 3.12,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 4,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 27,
      Current_Amps: 290,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 2.49,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 5,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 29.5,
      Current_Amps: 310,
      WireFeed_m_per_min: 8.25,
      TravelSpeed_mm_per_sec: 2.75,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 6,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 2.66,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 8,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 1.6,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 10,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 8,
      TravelSpeed_mm_per_sec: 1.33,
    },
    {
      MaterialType: 'Copper Alloy',
      Type: 'Manual',
      PlateThickness_mm: 12,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 6,
      TravelSpeed_mm_per_sec: 0.8,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: '<=1',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 15,
      Current_Amps: 65,
      WireFeed_m_per_min: 3,
      TravelSpeed_mm_per_sec: 4.74,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1 <=1.6',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 145,
      WireFeed_m_per_min: 4.125,
      TravelSpeed_mm_per_sec: 4.12,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1.6 <3',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 140,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 3.59,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 27,
      Current_Amps: 260,
      WireFeed_m_per_min: 5.25,
      TravelSpeed_mm_per_sec: 3.12,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 4,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 27,
      Current_Amps: 290,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 2.49,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 5,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 29.5,
      Current_Amps: 310,
      WireFeed_m_per_min: 8.25,
      TravelSpeed_mm_per_sec: 2.75,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 6,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 2.66,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 8,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 1.6,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 10,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 8,
      TravelSpeed_mm_per_sec: 1.33,
    },
    {
      MaterialType: 'Stainless Steel',
      Type: 'Manual',
      PlateThickness_mm: 12,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 6,
      TravelSpeed_mm_per_sec: 0.8,
    },

    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: '<=1',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 15,
      Current_Amps: 65,
      WireFeed_m_per_min: 3,
      TravelSpeed_mm_per_sec: 4.74,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1 <=1.6',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 145,
      WireFeed_m_per_min: 4.125,
      TravelSpeed_mm_per_sec: 4.12,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1.6 <3',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 140,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 3.59,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 27,
      Current_Amps: 260,
      WireFeed_m_per_min: 5.25,
      TravelSpeed_mm_per_sec: 3.12,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 4,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 27,
      Current_Amps: 290,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 2.49,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 5,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 29.5,
      Current_Amps: 310,
      WireFeed_m_per_min: 8.25,
      TravelSpeed_mm_per_sec: 2.75,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 6,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 2.66,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 8,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 1.6,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 10,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 8,
      TravelSpeed_mm_per_sec: 1.33,
    },
    {
      MaterialType: 'Carbon Steel',
      Type: 'Manual',
      PlateThickness_mm: 12,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 6,
      TravelSpeed_mm_per_sec: 0.8,
    },

    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: '<=1',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 15,
      Current_Amps: 65,
      WireFeed_m_per_min: 3,
      TravelSpeed_mm_per_sec: 4.74,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1 <=1.6',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 145,
      WireFeed_m_per_min: 4.125,
      TravelSpeed_mm_per_sec: 4.12,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: '>1.6 <3',
      WireDiameter_mm: 0.8,
      Voltage_Volts: 18,
      Current_Amps: 140,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 3.59,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 3,
      WireDiameter_mm: 0.8,
      Voltage_Volts: 27,
      Current_Amps: 260,
      WireFeed_m_per_min: 5.25,
      TravelSpeed_mm_per_sec: 3.12,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 4,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 27,
      Current_Amps: 290,
      WireFeed_m_per_min: 2.7,
      TravelSpeed_mm_per_sec: 2.49,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 5,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 29.5,
      Current_Amps: 310,
      WireFeed_m_per_min: 8.25,
      TravelSpeed_mm_per_sec: 2.75,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 6,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 2.66,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 8,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 9,
      TravelSpeed_mm_per_sec: 1.6,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 10,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 8,
      TravelSpeed_mm_per_sec: 1.33,
    },
    {
      MaterialType: 'Galvanized Steel',
      Type: 'Manual',
      PlateThickness_mm: 12,
      WireDiameter_mm: 1.2,
      Voltage_Volts: 35,
      Current_Amps: 400,
      WireFeed_m_per_min: 6,
      TravelSpeed_mm_per_sec: 0.8,
    },
  ];

  /**
   * Return the best matching migWeldingData entry for the given materialType and thickness.
   * Matching rules (in order):
   * 1. Exact numeric match on PlateThickness_mm (when numeric) and type matches (if provided)
   * 2. If PlateThickness_mm is a range string (e.g. '<=1', '>1 <=1.6', '>1.6 <3'), check if thickness falls in that range
   * 3. Otherwise return the smallest numeric PlateThickness_mm >= thickness for the requested material/type
   * 4. If none found, return the entry with the largest numeric PlateThickness_mm for that material/type
   */
  getWeldingData(materialType: string, thickness: number, weldingProcess: number, weldingType: string) {
    if (thickness == null || Number.isNaN(Number(thickness))) return null;
    const type = weldingType ?? null;

    // helper: match requested material against entries which may contain multiple
    // material names separated by commas and the word 'and' (e.g. 'Stainless Steel,Copper Alloy')
    const matchesMaterial = (entryMaterial: string, requested: string) => {
      if (!entryMaterial || !requested) return false;
      const requestedNorm = requested.trim().toLowerCase();
      // split on comma or the word 'and' (with optional surrounding spaces)
      const parts = entryMaterial
        .split(/\s*,\s*|\s+and\s+/i)
        .map((p) => p.trim().toLowerCase())
        .filter((p) => p.length > 0);
      return parts.includes(requestedNorm);
    };

    const candidates =
      weldingProcess === PrimaryProcessType.MigWelding
        ? this.migWeldingData.filter((r) => matchesMaterial(r.MaterialType, materialType) && (type == null || r.Type === type))
        : this.tigWeldingData.filter((r) => matchesMaterial(r.MaterialType, materialType) && (type == null || r.Type === type));
    if (!candidates || candidates.length === 0) return null;

    // helper to parse PlateThickness_mm which may be number or range string
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: Number(val), max: Number(val), isRange: false };
      if (typeof val === 'string') {
        // normalize spacing
        const s = val.replace(/\s+/g, '');
        // patterns: '<=1', '>1<=1.6', '>1.6<3', '3'
        // split by comparison operators
        const parts: { min?: number; max?: number } = {};
        // match <=number or <number or >=number or >number
        const re = /([<>]=?)([0-9]*\.?[0-9]+)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(s)) !== null) {
          const op = m[1];
          const num = Number(m[2]);
          if (op === '<' || op === '<=') {
            // upper bound
            parts.max = num;
            if (op === '<') parts.max = Number((num - Number.EPSILON).toFixed(6));
          } else if (op === '>' || op === '>=') {
            parts.min = num;
            if (op === '>') parts.min = Number((num + Number.EPSILON).toFixed(6));
          }
        }
        // If no operators matched but string is numeric, treat as exact
        if (!parts.min && !parts.max) {
          const n = Number(s);
          if (!Number.isNaN(n)) return { min: n, max: n, isRange: false };
        }
        return { min: parts.min ?? -Infinity, max: parts.max ?? Infinity, isRange: true };
      }
      return { min: -Infinity, max: Infinity, isRange: true };
    };

    // 1) check exact numeric matches
    const exact = candidates.find((r) => typeof r.PlateThickness_mm === 'number' && Number(r.PlateThickness_mm) === Number(thickness));
    if (exact) return exact;

    // 2) check range string matches
    for (const r of candidates) {
      const range = parseRange(r.PlateThickness_mm);
      if (thickness >= range.min && thickness <= range.max) return r;
    }

    // 3) numeric candidates sorted ascending — be tolerant of numeric strings as well
    const numeric = candidates
      .map((r) => ({ row: r, num: Number(r.PlateThickness_mm) }))
      .filter((x) => !Number.isNaN(x.num))
      .sort((a, b) => a.num - b.num)
      .map((x) => ({ ...x.row, PlateThicknessNumeric: x.num }));

    const ge = numeric.find((r) => Number(r.PlateThicknessNumeric) >= Number(thickness));
    if (ge) return ge;

    // 4) fallback: largest numeric thickness
    if (numeric.length > 0) return numeric[numeric.length - 1];

    // nothing matched
    return null;
  }

  weldingEfficiencies = [
    {
      weldingPosition: 'Flat',
      weldingPositionId: 1,
      efficiency: {
        automated: 0.9,
        manual: 0.85,
      },
    },
    {
      weldingPosition: 'Horizontal',
      weldingPositionId: 2,
      efficiency: {
        automated: 0.9,
        manual: 0.85,
      },
    },
    {
      weldingPosition: 'Vertical',
      weldingPositionId: 3,
      efficiency: {
        automated: 0.85,
        manual: 0.8,
      },
    },
    {
      weldingPosition: 'Overhead',
      weldingPositionId: 4,
      efficiency: {
        automated: 0.8,
        manual: 0.75,
      },
    },
    {
      weldingPosition: 'Circular',
      weldingPositionId: 5,
      efficiency: {
        automated: 0.8,
        manual: 0.75,
      },
    },
    {
      weldingPosition: 'Combination',
      weldingPositionId: 6,
      efficiency: {
        automated: 0.86,
        manual: 0.81,
      },
    },
  ];

  getWeldingEfficiency(position: number, isAutomated: boolean): number {
    const entry = this.weldingEfficiencies.find((item) => item.weldingPositionId === position);

    if (!entry) {
      console.warn(`Welding position "${position}" not found.`);
      return 0;
    }

    return isAutomated ? entry.efficiency.automated : entry.efficiency.manual;
  }

  unloadingTimeData = [
    { minWeight: 0, maxWeight: 1000, complexity: 'Very Simple', unloadingTimeSec: 10 },
    { minWeight: 1001, maxWeight: 4000, complexity: 'Simple', unloadingTimeSec: 30 },
    { minWeight: 4001, maxWeight: 10000, complexity: 'Medium', unloadingTimeSec: 60 },
    { minWeight: 10001, maxWeight: 25000, complexity: 'High', unloadingTimeSec: 120 },
    { minWeight: 25001, maxWeight: Infinity, complexity: 'Very High', unloadingTimeSec: 300 },
  ];

  getUnloadingTime = (weight: number): number => this.unloadingTimeData.find((d) => weight >= d.minWeight && weight <= d.maxWeight)?.unloadingTimeSec || 0;

  defaultPercentages(processTypeId: number, partComplexity = PartComplexity.Low, percentageType = 'yieldPercentage') {
    const vals = [
      { processTypeId: ProcessType.MigWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.TigWelding, yieldPercentage: { 1: 98, 2: 96, 3: 94 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.SpotWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.StickWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.SeamWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.SubMergedArcWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.Sonicwelding, yieldPercentage: { 1: 98, 2: 97, 3: 96 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.FrictionWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
    ];
    return vals.find((x) => x.processTypeId === processTypeId)?.[percentageType]?.[partComplexity] || vals[3]?.[percentageType]?.[partComplexity];
  }

  public weldFinishTypes = [
    { id: 1, name: 'Weld Cleaning' },
    { id: 2, name: 'Grind/Polish' },
  ];
}
