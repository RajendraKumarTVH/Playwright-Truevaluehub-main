import { Injectable } from '@angular/core';
import { MaterialCategory } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class CostingConfig {
  getStockForms() {
    let list: any[] = [];
    list = [
      { id: StockForm.Film, name: 'Film' },
      { id: StockForm.Membrane, name: 'Membrane' },
      { id: StockForm.Ingot, name: 'Ingot' },
      { id: StockForm.Sheet, name: 'Sheet' },
      { id: StockForm.CChannel, name: 'C-Channel' },
      { id: StockForm.Wax, name: 'Wax' },
      { id: StockForm.Flat, name: 'Flat' },
      { id: StockForm.Ore, name: 'Ore' },
      { id: StockForm.Liquid, name: 'Liquid' },
      { id: StockForm.Foam, name: 'Foam' },
      { id: StockForm.Bar, name: 'Bar' },
      { id: StockForm.Pulp, name: 'Pulp' },
      { id: StockForm.Cardboard, name: 'Cardboard' },
      { id: StockForm.RectangularBar, name: 'Rectangular bar' },
      { id: StockForm.Section, name: 'Section' },
      { id: StockForm.CustomExtrusion, name: 'Custom Extrusion' },
      { id: StockForm.Pallet, name: 'Pallet' },
      { id: StockForm.Fiber, name: 'Fiber' },
      { id: StockForm.Billet, name: 'Billet' },
      { id: StockForm.ExtrusionDrawnForms, name: 'Extrusion/Drawn Forms' },
      { id: StockForm.Cord, name: 'Cord' },
      { id: StockForm.Wire, name: 'Wire' },
      { id: StockForm.Granules, name: 'Granules' },
      { id: StockForm.SquareBillet, name: 'Square Billet' },
      { id: StockForm.Rod, name: 'Rod' },
      { id: StockForm.Sand, name: 'Sand' },
      { id: StockForm.HexBar, name: 'Hex Bar' },
      { id: StockForm.Oil, name: 'Oil' },
      { id: StockForm.Coil, name: 'Coil' },
      { id: StockForm.Paste, name: 'Paste' },
      { id: StockForm.Gas, name: 'Gas' },
      { id: StockForm.Yarn, name: 'Yarn' },
      { id: StockForm.Foil, name: 'Foil' },
      { id: StockForm.SquareTube, name: 'Square Tube' },
      { id: StockForm.Plank, name: 'Plank' },
      { id: StockForm.Stone, name: 'Stone' },
      { id: StockForm.Usteel, name: 'U-steel' },
      { id: StockForm.FoamTape, name: 'Foam Tape' },
      { id: StockForm.Stock, name: 'Stock' },
      { id: StockForm.Dough, name: 'Dough' },
      { id: StockForm.Box, name: 'Box' },
      { id: StockForm.SeamlessTube, name: 'Seamless Tube' },
      { id: StockForm.RoundBar, name: 'Round Bar' },
      { id: StockForm.SquareBar, name: 'Square Bar' },
      { id: StockForm.Tube, name: 'Tube' },
      { id: StockForm.Thread, name: 'Thread' },
      { id: StockForm.Plate, name: 'Plate' },
      { id: StockForm.SquarePlate, name: 'Square Plate' },
      { id: StockForm.Strip, name: 'Strip' },
      { id: StockForm.LAngle, name: 'L Angle' },
      { id: StockForm.Paper, name: 'Paper' },
      { id: StockForm.Roll, name: 'Roll' },
      { id: StockForm.SquarePipe, name: 'Square Pipe' },
      { id: StockForm.SerpentinePipe, name: 'Serpentine Pipe' },
      { id: StockForm.Powder, name: 'Powder' },
      { id: StockForm.Pipe, name: 'Pipe' },
      { id: StockForm.Chips, name: 'Chips' },
    ];

    return list;
  }

  getUnitOfMeasure() {
    let list: any[] = [];
    list = [
      { id: 1, convertionValue: 'mm' },
      { id: 2, convertionValue: 'inches' },
      { id: 3, convertionValue: 'cm' },
      { id: 4, convertionValue: 'm' },
      { id: 5, convertionValue: 'feet' },
    ];
    return list;
  }

  getBOMColumns() {
    return [
      { field: 'partNumber', header: 'Part Name', mandatory: false, width: 200 },
      { field: 'partDescription', header: 'Description', mandatory: false, width: 250 },
      { field: 'partQty', header: 'Annual Volume', mandatory: true, width: 250 },
      { field: 'status', header: 'Status', mandatory: false, width: 200 },
      { field: 'commodityId', header: 'Category', mandatory: false, width: 200 },
      { field: 'vendorId', header: 'Supplier', mandatory: false, width: 200 },
      { field: 'buId', header: 'Delivery Site', mandatory: false, width: 200 },
    ];
  }

  getPartFamilyList() {
    let list: any[] = [];
    list = [
      { id: 1, name: 'Wire' },
      { id: 2, name: 'Terminal' },
      { id: 3, name: 'Connector' },
      { id: 4, name: 'Tape' },
      { id: 5, name: 'Clamp' },
      { id: 6, name: 'Clip/Tie' },
      { id: 7, name: 'Splice' },
      { id: 8, name: 'Shrink Tube' },
      { id: 9, name: 'Tube' },
      { id: 10, name: 'Seal' },
      { id: 11, name: 'Grommet' },
      { id: 12, name: 'Fuse' },
      { id: 13, name: 'Inline Fuse Holder' },
      { id: 14, name: 'Adaptor' },
      { id: 15, name: 'Lable' },
      { id: 16, name: 'Caps' },
      { id: 17, name: 'Relay' },
      { id: 18, name: 'Diode' },
      { id: 19, name: 'Secondary Locks' },
      { id: 20, name: 'Sleeves' },
      { id: 21, name: 'Sprial Wraps' },
      { id: 22, name: 'Others' },
    ];
    return list;
  }

  // setCavityLenght(value: number) {
  //   if (value === 1) {
  //     return 1;
  //   } else if (value > 1 && value <= 2) {
  //     return 2;
  //   } else if (value > 2 && value <= 4) {
  //     return 2;
  //   } else if (value > 4 && value <= 6) {
  //     return 3;
  //   } else if (value > 6 && value <= 8) {
  //     return 4;
  //   } else if (value > 8 && value <= 12) {
  //     return 6;
  //   } else if (value > 12 && value <= 16) {
  //     return 4;
  //   } else if (value > 16 && value <= 32) {
  //     return 8;
  //   } else if (value > 32 && value <= 64) {
  //     return 2;
  //   } else if (value > 64) {
  //     return Math.round(Number(value / 2));
  //   } else {
  //     return 1;
  //   }
  // }

  cavityColsRows(cavities: number) {
    return (
      [
        // { id: 1, noCavities: 1, columns: 1, rows: 1 },
        // { id: 2, noCavities: 2, columns: 2, rows: 1 },
        // { id: 3, noCavities: 3, columns: 3, rows: 1 },
        // { id: 4, noCavities: 4, columns: 2, rows: 2 },
        // { id: 5, noCavities: 5, columns: 5, rows: 1 },
        // { id: 6, noCavities: 6, columns: 3, rows: 2 },
        // { id: 7, noCavities: 7, columns: 7, rows: 1 },
        // { id: 8, noCavities: 8, columns: 4, rows: 2 },
        // { id: 9, noCavities: 9, columns: 3, rows: 3 },
        // { id: 10, noCavities: 10, columns: 5, rows: 2 },
        // { id: 11, noCavities: 11, columns: 11, rows: 1 },
        // { id: 12, noCavities: 12, columns: 4, rows: 3 },
        // { id: 13, noCavities: 13, columns: 13, rows: 1 },
        // { id: 14, noCavities: 14, columns: 7, rows: 2 },
        // { id: 15, noCavities: 15, columns: 5, rows: 3 },
        // { id: 16, noCavities: 16, columns: 4, rows: 4 },
        { id: 1, noCavities: 1, columns: 1, rows: 1 },
        { id: 2, noCavities: 2, columns: 2, rows: 1 },
        { id: 4, noCavities: 4, columns: 2, rows: 2 },
        { id: 6, noCavities: 6, columns: 3, rows: 2 },
        { id: 8, noCavities: 8, columns: 4, rows: 2 },
        { id: 16, noCavities: 16, columns: 4, rows: 4 },
        { id: 16, noCavities: 12, columns: 6, rows: 2 },
        { id: 16, noCavities: 32, columns: 8, rows: 4 },
        { id: 16, noCavities: 64, columns: 8, rows: 8 },
      ].filter((x) => x.noCavities === cavities)[0] || { id: 1, noCavities: cavities, columns: Math.round(cavities / 2), rows: Math.round(cavities / Math.round(cavities / 2)) }
    );
  }

  typeOfWeld() {
    return [
      { id: 1, name: 'Fillet Weld' },
      { id: 2, name: 'Lap Weld' },
      { id: 3, name: 'Butt Weld (Full Peneteration)' },
      { id: 4, name: 'Butt Weld (Partial Peneteration)' },
    ];
  }

  typeOfWelds() {
    return [
      { id: 1, name: 'Fillet' },
      { id: 2, name: 'Square' },
      { id: 3, name: 'Plug' },
      { id: 4, name: 'Bevel/Flare/ V Groove' },
      { id: 5, name: 'U/J Groove' },
    ];
  }

  weldPositionList() {
    return [
      { id: 1, name: 'Flat' },
      { id: 2, name: 'Horizontal' },
      { id: 3, name: 'Vertical' },
      { id: 4, name: 'OverHead' },
      // { id: 5, name: 'Circular' },
      { id: 6, name: 'Combination' },
    ];
  }

  typeOfMaterialBase() {
    return [
      { id: 1, name: 'Carbon Steel' },
      { id: 2, name: 'SS 301 to 308' },
      { id: 3, name: 'SS316' },
    ];
  }

  weldingDefaultPercentage(processTypeId: number, partComplexity = 1, percentageType = 'yieldPercentage') {
    // 1- low, 2-medium, 3-high
    const vals = [
      { processTypeId: ProcessType.Sonicwelding, yieldPercentage: { 1: 98, 2: 97, 3: 96 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
      { processTypeId: ProcessType.TigWelding, yieldPercentage: { 1: 98, 2: 96, 3: 94 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.SpotWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.SeamWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
      { processTypeId: ProcessType.MigWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.StickWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
      { processTypeId: ProcessType.FrictionWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
    ];
    return vals.find((x) => x.processTypeId === processTypeId)?.[percentageType]?.[partComplexity] || vals[3]?.[percentageType]?.[partComplexity]; // default as mig welding data
  }

  weldingPositionList(weldType = 'welding') {
    if (weldType === 'stickWelding') {
      return [
        { id: 1, name: '1G Manual', EffeciencyAuto: 75, EffeciencyManual: 75, EffeciencySemiAuto: 75 },
        { id: 2, name: '2G Manual', EffeciencyAuto: 65, EffeciencyManual: 65, EffeciencySemiAuto: 65 },
        { id: 3, name: '3G Manual', EffeciencyAuto: 60, EffeciencyManual: 60, EffeciencySemiAuto: 60 },
        { id: 4, name: '4G Manual', EffeciencyAuto: 50, EffeciencyManual: 50, EffeciencySemiAuto: 50 },
        { id: 5, name: '1G Robotic', EffeciencyAuto: 85, EffeciencyManual: 85, EffeciencySemiAuto: 85 },
        { id: 6, name: '2G Robotic', EffeciencyAuto: 75, EffeciencyManual: 75, EffeciencySemiAuto: 75 },
        { id: 7, name: '3G Robotic', EffeciencyAuto: 70, EffeciencyManual: 70, EffeciencySemiAuto: 70 },
        { id: 8, name: '4G Robotic', EffeciencyAuto: 60, EffeciencyManual: 60, EffeciencySemiAuto: 60 },
      ];
    } else {
      // all the others
      return [
        { id: 1, name: 'Flat', EffeciencyAuto: 80, EffeciencyManual: 70, EffeciencySemiAuto: 80 },
        { id: 2, name: 'Horizontal', EffeciencyAuto: 80, EffeciencyManual: 70, EffeciencySemiAuto: 80 },
        { id: 3, name: 'Vertical', EffeciencyAuto: 75, EffeciencyManual: 65, EffeciencySemiAuto: 75 },
        { id: 4, name: 'OverHead', EffeciencyAuto: 75, EffeciencyManual: 65, EffeciencySemiAuto: 75 },
      ];
    }
  }

  noOfTrackWeld(len: number): number {
    const weldList = [
      { toLength: 100, noOfWeld: 2 },
      { toLength: 250, noOfWeld: 3 },
      { toLength: 500, noOfWeld: 4 },
      { toLength: 1000, noOfWeld: 8 },
      { toLength: 1500, noOfWeld: 12 },
      { toLength: 2000, noOfWeld: 16 },
      { toLength: 2500, noOfWeld: 20 },
      { toLength: 3000, noOfWeld: 24 },
      { toLength: 3500, noOfWeld: 30 },
      { toLength: 4000, noOfWeld: 34 },
      { toLength: 4500, noOfWeld: 38 },
      { toLength: 5000, noOfWeld: 44 },
      { toLength: 5500, noOfWeld: 50 },
      { toLength: 6000, noOfWeld: 54 },
      { toLength: 6500, noOfWeld: 58 },
      { toLength: 7000, noOfWeld: 62 },
      { toLength: 7500, noOfWeld: 68 },
      { toLength: 8000, noOfWeld: 72 },
      { toLength: 8500, noOfWeld: 76 },
      { toLength: 9000, noOfWeld: 80 },
      { toLength: 1000000, noOfWeld: 85 },
    ];
    return weldList.find((x) => x.toLength >= len).noOfWeld || weldList[weldList.length - 1].noOfWeld;
  }

  weldPass(len: number, weldType = 'welding'): number {
    let weldList = [];
    if (weldType === 'stickWelding') {
      weldList = [
        { toWeldLegLength: 3, noOfWeldPasses: 1 },
        { toWeldLegLength: 6, noOfWeldPasses: 2 },
        { toWeldLegLength: 10000, noOfWeldPasses: 3 },
      ];
    } else {
      weldList = [
        { toWeldLegLength: 8, noOfWeldPasses: 1 },
        { toWeldLegLength: 12, noOfWeldPasses: 2 },
        { toWeldLegLength: 10000, noOfWeldPasses: 0 },
      ];
      // if (value <= 8) {
      //   return 1;
      // } else if (value <= 12) {
      //   return 2;
      // } else {
      //   return 0;
      // }
    }
    return weldList.find((x) => x.toWeldLegLength >= len).noOfWeldPasses || weldList[weldList.length - 1].noOfWeldPasses;
  }

  weldingValuesForStickWelding() {
    return [
      { id: 1, ToPartThickness: 3.175, WireDiameter: 1.6, Current: 33, Voltage: 22.5, TravelSpeed: 1.25 },
      { id: 2, ToPartThickness: 4.7625, WireDiameter: 2.4, Current: 83, Voltage: 23.5, TravelSpeed: 1.5 },
      { id: 3, ToPartThickness: 6.35, WireDiameter: 3.2, Current: 120, Voltage: 23.5, TravelSpeed: 1.67 },
      { id: 4, ToPartThickness: 8, WireDiameter: 4, Current: 165, Voltage: 24, TravelSpeed: 1.88 },
      { id: 5, ToPartThickness: 9.525, WireDiameter: 4.8, Current: 208, Voltage: 25.5, TravelSpeed: 2 },
      { id: 6, ToPartThickness: 12.7, WireDiameter: 6.4, Current: 313, Voltage: 26.5, TravelSpeed: 2.17 },
      { id: 7, ToPartThickness: 10000, WireDiameter: 8, Current: 400, Voltage: 28, TravelSpeed: 2.5 },
    ];
  }

  weldingMachineValuesForSeamWelding() {
    return [
      { id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
      { id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
      { id: 3, machine: 'FN-160-H', weldingEfficiency: 31.05 },
      { id: 4, machine: 'FN-100-E', weldingEfficiency: 27.945 },
      { id: 5, machine: 'FN-160-E', weldingEfficiency: 25.1505 },
    ];
  }

  weldingValuesForMachineType() {
    return [
      { id: 1, FromPartThickness: 0, ToPartThickness: 1, WireDiameter: 0.8, Voltage: 15, Current: 65, WireFeed: 4, TravelSpeed: 8 },
      { id: 1, FromPartThickness: 1.1, ToPartThickness: 1.6, WireDiameter: 1, Voltage: 18, Current: 145, WireFeed: 5.5, TravelSpeed: 8.5 },
      { id: 1, FromPartThickness: 1.7, ToPartThickness: 3, WireDiameter: 1.2, Voltage: 18, Current: 140, WireFeed: 3.6, TravelSpeed: 6.5 },
      { id: 1, FromPartThickness: 3.1, ToPartThickness: 6, WireDiameter: 1.2, Voltage: 27, Current: 260, WireFeed: 7, TravelSpeed: 7.9 },
      { id: 1, FromPartThickness: 6.1, ToPartThickness: 10, WireDiameter: 1.2, Voltage: 27, Current: 290, WireFeed: 3.6, TravelSpeed: 7.4 },
      { id: 1, FromPartThickness: 10.1, ToPartThickness: 15, WireDiameter: 1.2, Voltage: 29.5, Current: 310, WireFeed: 11, TravelSpeed: 6.5 },
      { id: 1, FromPartThickness: 15.1, ToPartThickness: 100000, WireDiameter: 2, Voltage: 35, Current: 400, WireFeed: 12, TravelSpeed: 7.8 },
      { id: 3, FromPartThickness: 0, ToPartThickness: 1, WireDiameter: 0.8, Voltage: 15, Current: 65, WireFeed: 3, TravelSpeed: 6 },
      { id: 3, FromPartThickness: 1.1, ToPartThickness: 1.6, WireDiameter: 1, Voltage: 18, Current: 145, WireFeed: 4.125, TravelSpeed: 6.38 },
      { id: 3, FromPartThickness: 1.7, ToPartThickness: 3, WireDiameter: 1.2, Voltage: 18, Current: 140, WireFeed: 2.7, TravelSpeed: 4.88 },
      { id: 3, FromPartThickness: 3.1, ToPartThickness: 6, WireDiameter: 1.2, Voltage: 27, Current: 260, WireFeed: 5.25, TravelSpeed: 5.93 },
      { id: 3, FromPartThickness: 6.1, ToPartThickness: 10, WireDiameter: 1.2, Voltage: 27, Current: 290, WireFeed: 2.7, TravelSpeed: 5.55 },
      { id: 3, FromPartThickness: 10.1, ToPartThickness: 15, WireDiameter: 1.2, Voltage: 29.5, Current: 310, WireFeed: 8.25, TravelSpeed: 4.88 },
      { id: 3, FromPartThickness: 15.1, ToPartThickness: 100000, WireDiameter: 2, Voltage: 35, Current: 400, WireFeed: 9, TravelSpeed: 5.85 },
    ]; // 1 is automatic & 3 is manual
  }

  tigWeldingValuesForMachineType() {
    return [
      { id: 1, FromPartThickness: 0, ToPartThickness: 1.6, WireDiameter: 1.6, Voltage: 15, Current: 90, WireFeed: 4, TravelSpeed: 4 },
      { id: 1, FromPartThickness: 1.7, ToPartThickness: 3.2, WireDiameter: 2.4, Voltage: 18, Current: 130, WireFeed: 5.5, TravelSpeed: 4 },
      { id: 1, FromPartThickness: 3.3, ToPartThickness: 4.8, WireDiameter: 3.2, Voltage: 18, Current: 225, WireFeed: 3.6, TravelSpeed: 4 },
      { id: 1, FromPartThickness: 4.9, ToPartThickness: 100006.4, WireDiameter: 4.8, Voltage: 27, Current: 313, WireFeed: 7, TravelSpeed: 3 },
      { id: 3, FromPartThickness: 0, ToPartThickness: 1.6, WireDiameter: 1.6, Voltage: 15, Current: 90, WireFeed: 3, TravelSpeed: 3 },
      { id: 3, FromPartThickness: 1.7, ToPartThickness: 3.2, WireDiameter: 2.4, Voltage: 18, Current: 130, WireFeed: 4.125, TravelSpeed: 3 },
      { id: 3, FromPartThickness: 3.3, ToPartThickness: 4.8, WireDiameter: 3.2, Voltage: 18, Current: 225, WireFeed: 2.7, TravelSpeed: 3 },
      { id: 3, FromPartThickness: 4.9, ToPartThickness: 100006.4, WireDiameter: 4.8, Voltage: 27, Current: 312.5, WireFeed: 5.25, TravelSpeed: 3 },
    ]; // 1 is automatic & 3 is manual
  }

  spotWeldingValuesForMachineType() {
    return [
      { id: 1, toPartThickness: 0.254, weldForce: 353, weldTime: 4, holdTime: 5, weldCurrent: { 6: 4000, 12: 3200, 18: 2600 }, openCircuitVoltage: 1.6 },
      { id: 2, toPartThickness: 0.5334, weldForce: 538, weldTime: 6, holdTime: 8, weldCurrent: { 6: 6500, 12: 5200, 18: 4225 }, openCircuitVoltage: 1.6 },
      { id: 3, toPartThickness: 0.7874, weldForce: 719, weldTime: 8, holdTime: 10, weldCurrent: { 6: 8000, 12: 6400, 18: 5200 }, openCircuitVoltage: 1.6 },
      { id: 4, toPartThickness: 1.016, weldForce: 908, weldTime: 10, holdTime: 12, weldCurrent: { 6: 8800, 12: 7040, 18: 5720 }, openCircuitVoltage: 1.6 },
      { id: 5, toPartThickness: 1.27, weldForce: 1221, weldTime: 14, holdTime: 16, weldCurrent: { 6: 9600, 12: 7680, 18: 6240 }, openCircuitVoltage: 1.6 },
      { id: 6, toPartThickness: 1.5748, weldForce: 1477, weldTime: 18, holdTime: 20, weldCurrent: { 6: 10600, 12: 8480, 18: 6890 }, openCircuitVoltage: 1.6 },
      { id: 7, toPartThickness: 1.9812, weldForce: 1991, weldTime: 25, holdTime: 30, weldCurrent: { 6: 11800, 12: 9440, 18: 7670 }, openCircuitVoltage: 1.6 },
      { id: 8, toPartThickness: 2.3876, weldForce: 2557, weldTime: 34, holdTime: 35, weldCurrent: { 6: 13000, 12: 10400, 18: 8450 }, openCircuitVoltage: 1.6 },
      { id: 9, toPartThickness: 2.7686, weldForce: 3175, weldTime: 45, holdTime: 40, weldCurrent: { 6: 14200, 12: 11360, 18: 9230 }, openCircuitVoltage: 1.6 },
      { id: 10, toPartThickness: 3.175, weldForce: 3880, weldTime: 60, holdTime: 45, weldCurrent: { 6: 15600, 12: 12480, 18: 10140 }, openCircuitVoltage: 1.6 },
      { id: 11, toPartThickness: 3.9624, weldForce: 5512, weldTime: 93, holdTime: 50, weldCurrent: { 6: 18000, 12: 14400, 18: 11700 }, openCircuitVoltage: 2.5 },
      { id: 12, toPartThickness: 4.7498, weldForce: 7363, weldTime: 130, holdTime: 55, weldCurrent: { 6: 20500, 12: 16400, 18: 13325 }, openCircuitVoltage: 2.5 },
      { id: 13, toPartThickness: 6.35, weldForce: 12258, weldTime: 230, holdTime: 60, weldCurrent: { 6: 26000, 12: 20800, 18: 16900 }, openCircuitVoltage: 3.55 },
    ];
  }

  weldingValuesForPartHandling(weldType = 'welding') {
    if (weldType === 'spotWelding') {
      return [
        { id: 1, toPartWeight: 1, loading: 2, unloading: 2 },
        { id: 2, toPartWeight: 4, loading: 5, unloading: 5 },
        { id: 3, toPartWeight: 10, loading: 10, unloading: 10 },
        { id: 4, toPartWeight: 25, loading: 20, unloading: 20 },
        { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 },
      ];
    } else if (weldType === 'seamWelding') {
      return [
        { id: 1, toPartWeight: 1, loading: 8, unloading: 8 },
        { id: 2, toPartWeight: 5, loading: 16, unloading: 16 },
        { id: 3, toPartWeight: 10, loading: 24, unloading: 24 },
        { id: 4, toPartWeight: 20, loading: 32, unloading: 32 },
        { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 },
      ];
    } else if (weldType === 'stickWelding') {
      return [
        { id: 1, toPartWeight: 1, loading: 10, unloading: 10 },
        { id: 2, toPartWeight: 4, loading: 30, unloading: 30 },
        { id: 3, toPartWeight: 10, loading: 60, unloading: 60 },
        { id: 4, toPartWeight: 25, loading: 90, unloading: 90 },
        { id: 5, toPartWeight: 10000, loading: 180, unloading: 180 },
      ];
    } else {
      return [];
    }
  }

  machineTypeManufacturingData() {
    let list: any[] = [];
    list = [
      { id: 1, Handlingtime: 5, DirectLabour: 0.33, BourdanRate: 125 },
      { id: 2, Handlingtime: 7, DirectLabour: 0.5, BourdanRate: 115 },
      { id: 3, Handlingtime: 10, DirectLabour: 1, BourdanRate: 100 },
    ];
    return list;
  }

  partComplexityValues() {
    let list: any[] = [];
    list = [
      { id: 1, ShapeFactor: 6 },
      { id: 2, ShapeFactor: 8 },
      { id: 3, ShapeFactor: 10 },
    ];
    return list;
  }

  coreMakingMachingType() {
    return [
      { id: 1, fromWeight: 0, toWeight: 20, fromVolume: 0, toVolume: 100, type: 2 },
      { id: 2, fromWeight: 0, toWeight: 20, fromVolume: 100.01, toVolume: 10000000, type: 1 },
      { id: 3, fromWeight: 20.01, toWeight: 200000000, fromVolume: 0, toVolume: 100, type: 1 },
      { id: 4, fromWeight: 20.01, toWeight: 200000000, fromVolume: 100.01, toVolume: 10000000, type: 1 },
    ];
  }

  manipulatorType() {
    return [
      { id: 1, fromWeight: 0, toWeight: 4000, type: 1 },
      { id: 2, fromWeight: 4000.01, toWeight: 15000, type: 2 },
      { id: 3, fromWeight: 15000.01, toWeight: 10000000000, type: 3 },
    ];
  }

  loadingUnloadingTime(weight: number): number {
    const data = [
      { id: 1, fromWeight: 0, toWeight: 5, time: 5 },
      { id: 2, fromWeight: 5.01, toWeight: 10, time: 7 },
      { id: 3, fromWeight: 10.01, toWeight: 50, time: 10 },
      { id: 4, fromWeight: 50.01, toWeight: 100, time: 15 },
      { id: 5, fromWeight: 100.01, toWeight: 500, time: 20 },
      { id: 6, fromWeight: 500.01, toWeight: 1000, time: 30 },
      { id: 7, fromWeight: 1000.01, toWeight: 10000000, time: 60 },
    ];
    return data.find((x) => x.fromWeight <= weight && x.toWeight >= weight)?.time || 5;
  }

  moldLoadingTime(moldLength: number): number {
    const data = [
      { moldLength: 800, loadingTime: 120 },
      { moldLength: 1200, loadingTime: 150 },
      { moldLength: 2000, loadingTime: 180 },
      { moldLength: 2500, loadingTime: 210 },
      { moldLength: 3000, loadingTime: 240 },
      { moldLength: 4000, loadingTime: 300 },
      { moldLength: 10000000, loadingTime: 360 },
    ];
    return data.find((x) => x.moldLength >= moldLength)?.loadingTime || data[data.length - 1].loadingTime;
  }
}

export enum CommodityType {
  PlasticAndRubber = 1,
  SheetMetal = 2,
  Casting = 3,
  StockMachining = 4,
  MetalForming = 5,
  Extrusion = 6,
  AdditiveManufacturing = 7,
  PCBAQuickCosting = 8,
  Electricals = 9,
  Others = 10,
  Testing = 11,
  Assembly = 12,
  WiringHarness = 14,
  Electronics = 15,
  PrintedCircuitBoard = 16,
}

export enum ProcessType {
  //manufacturing
  BlowMolding = 1,
  Boring = 2,
  CenterlessGrinding = 4,
  ClosedDieForging = 5,
  ColdHeading = 6,
  CompressionMolding = 7,
  CylindricalGrinding = 8,
  Deburring = 9,
  Deflash = 10,
  DieCutTrim = 11,
  DiePenetrationTesting = 12,
  Drilling = 13,
  DrillingCenter = 113,
  FixtureInspection = 14,
  FrictionWelding = 15,
  //Gearhobbing = 16,
  GravityDieCasting = 17,
  GreenSandCasting = 18,
  HeatStaking = 19,
  HighPressureDieCasting = 20,
  Honning = 21,
  HotClosedDieForging = 22,
  HotOpenDieForging = 23,
  HotRingForging = 24,
  InjectionMouldingDoubleShot = 25,
  InjectionMouldingSingleShot = 26,
  InvestmentCasting = 27,
  Lapping = 28,
  LaserCutting = 29,
  LaserEtching = 30,
  LaserMarking = 31,
  LaserWelding = 32,
  LeakTesting = 33,
  IonicWashing = 159,
  IonicTesting = 160,
  LowPressureDieCasting = 34,
  ManualInspection = 35,
  MaterialComposisition = 36,
  MechanicalJoints = 37,
  MetalTubeExtrusion = 38,
  InductionHeatingMachine = 204,
  RollingStraightening = 205,
  EddyCurrentTesting = 206,
  BrightAnnealing = 207,
  Milling = 40,
  MillingCenter = 114,
  GrindingCenter = 115,
  GearCutting = 16,
  GearBroaching = 3,
  GearSplineRolling = 193,
  GearShaving = 194,
  GearGrinding = 195,
  OxyCutting = 41,
  PlasmaCutting = 43,
  PlasticExtrusion = 44,
  Plating = 45,
  PowderCoating = 46,
  ZincPlating = 130,
  ChromePlating = 131,
  NickelPlating = 143,
  TinPlating = 144,
  GoldPlating = 156,
  SilverPlating = 157,
  R2RPlating = 251,
  PressureTesting = 47,
  Printing = 48,
  Progressive = 49,
  RadiographyTesting = 50,
  RollForming = 51,
  RotorMolding = 52,
  RubberMaterialPreparation = 53,
  RubberVulcanization = 54,
  SaltSprayTesting = 55,
  ShellCasting = 56,
  ShotBlasting = 79,
  Sonicwelding = 58,
  SpotWelding = 59,
  MigWelding = 39,
  StickWelding = 209,
  SpringWireforming = 60,
  Stage = 61,
  SubMergedArcWelding = 62,
  SurfaceGrinding = 63,
  Tapping = 64,
  ThermoForming = 65,
  ThreadRolling = 66,
  TigWelding = 67,
  TransferMolding = 68,
  Turning = 69,
  TurningCenter = 112,
  TurretTPP = 70,
  UltrasonicTesting = 71,
  // VacuumForming = 72,
  VisualInspection = 73,
  WaterJetCutTrim = 74,
  WaterJetCutting = 75,
  Wrapping = 76,
  Bending = 99,
  MetalForming = 81,
  BandSaw = 82,
  RunnerRiserDegating = 83,
  PartCoolingShakeOut = 84,
  VaccumeImpregnation = 85,
  CorePreparation = 86,
  // HPDCMelting = 87, // not in db
  Cleaning = 88,
  CleaningCasting = 222,
  SawCutting = 89,
  StockHeating = 90,
  HeatTreatment = 122,
  TrimmingPress = 91,
  Machining = 92,
  CableWireCutting = 93,
  CableWireCrimping = 94,
  CableConnector = 95,
  CableInjectionMolding = 96,
  CableOverMolding = 97,
  CableWireTwisting = 98,
  CableBending = 80,
  CableStampingProcess = 100,
  CableSolderingProcess = 101,
  CablePottingProcess = 102,
  CableRoutingLine = 103,
  CableUltrasonicWelding = 104,
  CableHeatShrinkingTubing = 105,
  CableTieProcess = 106,
  CableLabeling = 107,
  Drawing = 108,
  StockShearing = 111,
  MoldPerparation = 116,
  Others = 120,
  Forming = 121,
  Assembly = 123,
  CablePreparation = 124,
  LineAssembly = 125,
  FinalInspection = 126,
  Painting = 42,
  // Paint = 128,
  Dry = 129,
  WetPainting = 127,
  SiliconCoatingAuto = 178,
  SiliconCoatingSemi = 179,
  Galvanization = 180,
  CastingCorePreparation = 141,
  CastingCoreAssembly = 142,
  PouringCasting = 77,
  MeltingCasting = 78,
  // CastingPouring = 137,
  // CastingMelting = 134,
  CastingMoldMaking = 135,
  CastingMoldAssembly = 136,
  CastingShakeout = 138,
  CastingDegating = 139,
  // CastingShotblasting = 140,
  CastingFettling = 133,
  MetullurgicalInspection = 132,

  WaxInjectionMolding = 167,
  TreePatternAssembly = 168,
  SlurryCoating = 169,
  Dewaxing = 170,
  ShellMoldFiring = 171,
  MoldKnockout = 172,

  CustomCableDrawing = 145,
  CustomCableAnnealing = 146,
  CustomCableThinning = 147,
  CustomCableTensionStreach = 148,
  CustomCableExtruder = 149,
  CustomCableDiameterControl = 150,
  CustomCableCoreLayUp = 151,
  CustomCableSheathing = 152,
  CustomCableSparkTest = 153,
  CustomCableCableMarking = 154,
  CustomCableSpooler = 155,
  Stitching = 165,
  RubberExtrusion = 166,
  //WireCuttingTermination = 166666,
  Passivation = 173,
  WeldingPreparation = 176,
  WeldingCleaning = 177,
  CleaningForging = 198,
  MaterialKitting = 182,
  ThroughHoleLine = 183,
  InCircuitTestProgramming = 184,
  Coating = 185,
  AdhesivePotting = 186,
  RoutingVScoring = 187,
  FunctionalTest = 188,
  LabellingnternalPackaging = 189,
  BarCodeReader = 190,
  SMTLine = 191,
  ElectronicsLaserMarking = 196,
  ElectronicsVisualInspection = 197,
  Testing = 199,
  Straightening = 200,
  Control = 201,
  LubricationPhosphating = 208,
  BilletHeating = 211,
  TrimmingPressForging = 212,
  TubeBending = 213,
  RubberFeltSheetCutting = 215,
  RubberFeltSheetStacking = 216,
  SeamStiching = 217,
  SeamWelding = 218,
  Brazing = 220,
  BearingPressing = 221,
  IngotBandSawCutting = 223,
  MetalExtrusion = 224,
  CutToLength = 225,
  PlasticTubeExtrusion = 226,
  PlasticConvolutedTubeExtrusion = 247,
  PlasticVacuumForming = 72,
  InnerLayer = 227,
  LaminationBonding = 228,
  PCBDrilling = 229,
  PCBPlating = 230,
  OuterLayer = 231,
  Soldermask = 232,
  SilkScreen = 233,
  SurfaceFinish = 234,
  RoutingScoring = 235,
  ETestBBT = 236,
  Shearing = 268,
  Cutting = 237,
  MaterialInspectionElectronics = 238,
  CuttingMachineElectronics = 239,
  CornersShaping = 240,
  AutomaticPCStacker = 241,
  Grind = 242,
  InspectionElectronics = 243,
  Baking = 244,
  WashingElectronics = 245,
  FQCInspection = 246,
  // PlasticConvolutedTubeManufacturing = 247,
  ManualDeflashing = 248,
  RubberInjectionMolding = 249,
  RubberInjectionMoldingDoubleShot = 250,
  //ReeltoReelPlating = 251,
  Pointing = 252,
  ConnectorAssemblyPlastics = 253,
  CleaningProcess = 254,
  PlasticRotorMolding = 255,
  TwinSheetForming = 256,
  CuttingandTrimming = 257,
  ScreenPrinting = 258,
  SilkPrinting = 259,
  VacuumCleaning = 260,
  RollBending = 261,
  Wirebendingandcutting = 262,
  TubeLaser = 263,
  TubeBendingMetal = 264,
  TransferPress = 265,
  Piercing = 266,
  //TransferPress=267,
  //CuttingShearing=268,
  CuttingShearing = 269,
  ImpedanceCouponTest = 270,
  DyePenetrantTest = 271,
  MagneticParticleTest = 272,
  BodyEndsOnly = 273,
  PMICertificateOfCompliance = 274,
  HardnessTest = 275,
  MicroStructureTest = 276,
  WitnessPouringTestForBodyBonnet = 277,
  FerriteContentTestSSTest = 278,
  ImpactTest = 279,
  PittingCorrosionTest = 280,
  IGCBodyBonnetTest = 281,
  Hydrotest = 282,
  ConduitTubeSleeveHSTPreparation = 283,
  FunctionalTestCableHarness = 284,
  EMPartAssemblyTesting = 285,
  BilletHeatingContinuousFurnace = 290,
  PostCuring = 353,
  CopperPlating = 354,
  EVAFilm = 355,
  Sand3DPrinting = 356,
  PlugConnectorOvermolding = 357,
  CMMInspection = 210,
  Preform = 360,
}

export enum StampingType {
  BlankingPunching = 1,
  Forming = 2,
  Drawing = 3,
  Bending = 4,
  Piercing = 5,
  Coining = 6,
  Compound = 7,
  Restrike = 8,
  // Transfer Press
  ShallowDrawRect = 9,
  RedrawRect = 10,
  Trimming = 11,
  ShallowDrawCir = 12,
  RedrawCir = 13,
}

export enum CableType {
  Cable = 1,
  Connector = 2,
  Terminal = 3,
  CustomisedInjectionMolded = 4,
  OverMoldMaterial = 5,
  CustomisedStamping = 6,
  HeatShrinkTube = 7,
  Electronic = 8,
  STDPurchasePartCable = 9,
  STDPurchasePartTape = 10,
  Potting = 11,
}

export enum TypeOfCable {
  SolidCore = 1,
  Multiconductor = 2,
  ShieldedTwistedPair = 3,
  UnShieldedTwistedPair = 4,
  CoAxial = 5,
  ThermalBraidedShelded = 6,
}

export enum HarnessMaterialProcess {
  CablePreparation = 106,
  ConduitTubeSleeveHSTPreparation = 107,
  EMPartAssemblyTesting = 108,
  FinalInspection = 109,
  FunctionalTest = 110,
  LineAssembly = 111,
}

export enum ForgingCutting {
  BandSawCutting = 1,
  StockShearing = 2,
}
export enum MountingType {
  Top = 1,
  Bottom = 2,
}
export enum PrimaryProcessType {
  // material
  InjectionMouldingDoubleShot = 1,
  InjectionMouldingSingleShot = 2,
  BlowMoulding = 3,
  CompressionMoulding = 4,
  TransferMolding = 6,
  ThermoForming = 7,
  LaserCutting = 10,
  OxyCutting = 11,
  PlasmaCutting = 12,
  WaterjetCutting = 13,
  StampingProgressive = 14,
  StampingStage = 15,
  TurretPunch = 16,
  HPDCCasting = 17,
  LPDCCasting = 18,
  GDCCasting = 19,
  GreenCastingAuto = 20,
  GreenCastingSemiAuto = 68,
  ColdForgingClosedDieHot = 23,
  ColdForgingColdHeading = 24,
  WeldingGMAW = 61000, // not found in db
  HotForgingClosedDieHot = 25,
  HotForgingOpenDieHot = 26,
  WiringHarness = 37,
  CableAssembly = 46,
  Assembly = 69,
  Painting = 53,
  Plating = 54,
  PowderCoating = 55,
  Printing = 56,
  MigWelding = 57,
  TigWelding = 58,
  SpotWelding = 77,
  StickWelding = 78,
  WetPainting = 59,
  ZincPlating = 60,
  ChromePlating = 61,
  NoBakeCasting = 62,
  InvestmentCasting = 21,
  ShellCasting = 22,
  VProcessSandCasting = 113,
  Sand3DPrinting = 114,
  NickelPlating = 63,
  CopperPlating = 112,
  TinPlating = 64,
  GoldPlating = 66,
  SilverPlating = 67,
  R2RPlating = 96,
  CustomizeCable = 65,
  ConnectorAssembly = 70,
  WireCuttingTermination = 71,
  RubberExtrusion = 48,
  SiliconCoatingAuto = 73,
  SiliconCoatingSemi = 74,
  Galvanization = 75,
  MetalTubeExtrusion = 49,
  ConventionalPCB = 84,
  HDIPCB = 85,
  TubeBending = 86,
  InsulationJacket = 87,
  SeamWelding = 88,
  Brazing = 90,
  MetalExtrusion = 91,
  PlasticTubeExtrusion = 92,
  PlasticVacuumForming = 8,
  RigidFlexPCB = 100,
  TransferPress = 102,
  SemiRigidFlex = 104,
  Electronics = 105,
  RubberInjectionMolding = 94,
  RoundBar = 51,
  RectangularBar = 43,
  RoundTube = 41,
  TubeLaserCutting = 116,
}

export enum SubProcessType {
  MetalForPouring = 1,
  SandForCore = 2,
  SandForMold = 3,
  PatternWax = 4,
  SlurryCost = 5,
  GreenSandCost = 6,
  ZirconSand = 7,
}

export enum LaborType {
  LowSkilledWorker = 1,
  NCProgrammer = 2,
  QualityInspectorOrSupervisor = 3,
  SemiSkilledMachineOperator = 4,
  SkilledMachineOperator = 5,
  SpecialSkilledMachineOperator = 6,
  ToolDesigner = 7,
  ToolMaker = 8,
}

export enum ToolType {
  PressMachine = 'PressMachine',
  PressBrake = 'PressBrake',
}

export enum MachiningTypes {
  Rod = 51, // Round bar
  Tube = 41, // Round tube
  SquareBar = 42,
  RectangularBar = 43,
  HexagonalBar = 44,
  Block = 58,
  Wire = 45,
  OtherShapes = 46,
  LAngle = 79,
  IBeam = 80,
  Channel = 81,
  WBeams = 82,
  HSS = 83,
}

export enum BendingToolTypes {
  Soft = 1,
  Dedicated = 2,
}

export enum SamplingLevel {
  None = 0,
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
}

export enum ScreeName {
  PartInfo = 1,
  Material = 2,
  Manufacturing = 3,
  Tooling = 4,
  ToolingMaterial = 5,
  ToolingManufacturing = 6,
  ToolingBOP = 7,
  ToolingOverHead = 8,
  SupportDocument = 9,
  SecondaryProcess = 10,
  Purchased = 11,
  OverheadProfit = 12,
  Packaging = 13,
  Logistic = 14,
  DutiesTraffic = 15,
  CostSummary = 16,
  SustainabilityMaterial = 17,
  SustainabilityManufacturing = 18,
  SustainabilityPackaging = 19,
  SustainabilityLogistic = 20,
  CadDrawing = 101,
}

export enum StockForm {
  Film = 1,
  Membrane = 2,
  Ingot = 3,
  Sheet = 4,
  CChannel = 5,
  Wax = 6,
  Flat = 7,
  Ore = 8,
  Liquid = 9,
  Foam = 10,
  Bar = 11,
  Pulp = 12,
  Cardboard = 13,
  RectangularBar = 14,
  Section = 15,
  CustomExtrusion = 16,
  Pallet = 17,
  Fiber = 18,
  Billet = 19,
  ExtrusionDrawnForms = 20,
  Cord = 21,
  Wire = 22,
  Granules = 23,
  SquareBillet = 24,
  Rod = 25,
  Sand = 26,
  HexBar = 27,
  Oil = 28,
  Coil = 29,
  Paste = 30,
  Gas = 31,
  Yarn = 32,
  Foil = 33,
  SquareTube = 34,
  Plank = 35,
  Stone = 36,
  Usteel = 37,
  FoamTape = 38,
  Stock = 39,
  Dough = 40,
  Box = 41,
  SeamlessTube = 42,
  RoundBar = 43,
  SquareBar = 44,
  Tube = 45,
  Thread = 46,
  Plate = 47,
  SquarePlate = 48,
  Strip = 49,
  LAngle = 50,
  Paper = 51,
  Roll = 52,
  SquarePipe = 53,
  SerpentinePipe = 54,
  Powder = 55,
  Pipe = 56,
  Chips = 57,
}

export const MaterialStockFormList = new Map<number, number[]>([
  [StockForm.Film, [MaterialCategory.Plastics, MaterialCategory.Packaging, MaterialCategory.PlasticFilm]],
  [StockForm.Membrane, [MaterialCategory.Plastics, MaterialCategory.PlasticFilm]],
  [StockForm.Ingot, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [
    StockForm.Sheet,
    [
      MaterialCategory.Ferrous,
      MaterialCategory.NonFerrous,
      MaterialCategory.Fabric,
      MaterialCategory.Foam,
      MaterialCategory.Packaging,
      MaterialCategory.PaintPowderGasSand,
      MaterialCategory.Plastics,
      MaterialCategory.Rubber,
    ],
  ],
  [StockForm.CChannel, [MaterialCategory.Ferrous]],
  [StockForm.Wax, [MaterialCategory.PaintPowderGasSand]],
  [StockForm.Flat, [MaterialCategory.Ferrous]],
  [StockForm.Ore, [MaterialCategory.NonFerrous]],
  [StockForm.Liquid, [MaterialCategory.Packaging, MaterialCategory.PaintPowderGasSand, MaterialCategory.Plastics, MaterialCategory.Rubber]],
  [StockForm.Foam, [MaterialCategory.Foam, MaterialCategory.Plastics]],
  [StockForm.Bar, [MaterialCategory.Ferrous]],
  [StockForm.Pulp, [MaterialCategory.Packaging]],
  [StockForm.Cardboard, [MaterialCategory.Packaging]],
  [StockForm.RectangularBar, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.Section, [MaterialCategory.NonFerrous]],
  [StockForm.CustomExtrusion, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.Pallet, [MaterialCategory.Packaging]],
  [StockForm.Fiber, [MaterialCategory.Plastics]],
  [StockForm.Billet, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.ExtrusionDrawnForms, [MaterialCategory.NonFerrous]],
  [StockForm.Cord, [MaterialCategory.Plastics]],
  [StockForm.Wire, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.Granules, [MaterialCategory.Plastics, MaterialCategory.PaintPowderGasSand, MaterialCategory.Rubber]],
  [StockForm.SquareBillet, [MaterialCategory.Ferrous]],
  [StockForm.Rod, [MaterialCategory.Ferrous, MaterialCategory.Plastics]],
  [StockForm.Sand, [MaterialCategory.PaintPowderGasSand]],
  [StockForm.HexBar, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.Oil, [MaterialCategory.Rubber]],
  [StockForm.Coil, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.Paste, [MaterialCategory.PaintPowderGasSand, MaterialCategory.Plastics]],
  [StockForm.Gas, [MaterialCategory.PaintPowderGasSand]],
  [StockForm.Yarn, [MaterialCategory.Plastics]],
  [StockForm.Foil, [MaterialCategory.NonFerrous]],
  [StockForm.SquareTube, [MaterialCategory.NonFerrous]],
  [StockForm.Plank, [MaterialCategory.Packaging]],
  [StockForm.Stone, [MaterialCategory.PaintPowderGasSand]],
  [StockForm.Usteel, [MaterialCategory.Ferrous]],
  [StockForm.FoamTape, [MaterialCategory.Foam]],
  [StockForm.Stock, [MaterialCategory.Packaging]],
  [StockForm.Dough, [MaterialCategory.Rubber]],
  [StockForm.Box, [MaterialCategory.Packaging]],
  [StockForm.SeamlessTube, [MaterialCategory.Ferrous]],
  [StockForm.RoundBar, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous, MaterialCategory.Plastics]],
  [StockForm.SquareBar, [MaterialCategory.NonFerrous]],
  [StockForm.Tube, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous, MaterialCategory.Plastics, MaterialCategory.Rubber]],
  [StockForm.Thread, [MaterialCategory.Rubber]],
  [StockForm.Plate, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.SquarePlate, [MaterialCategory.NonFerrous]],
  [StockForm.Strip, [MaterialCategory.Ferrous, MaterialCategory.NonFerrous]],
  [StockForm.LAngle, [MaterialCategory.Ferrous]],
  [StockForm.Paper, [MaterialCategory.Packaging]],
  [StockForm.Roll, [MaterialCategory.Plastics]],
  [StockForm.SquarePipe, [MaterialCategory.Ferrous]],
  [StockForm.SerpentinePipe, [MaterialCategory.Ferrous]],
  [StockForm.Powder, [MaterialCategory.Ferrous, MaterialCategory.PaintPowderGasSand, MaterialCategory.Plastics]],
  [StockForm.Pipe, [MaterialCategory.Ferrous, MaterialCategory.Plastics]],
  [StockForm.Chips, [MaterialCategory.Rubber]],
]);

export class MachineDetails {
  selectedProcessTypeName: string = '';
  selectedProcessTypeId: number = 0;
  machineName: string = '';
  investCost: number = 0;
  installation: number = 0;
  age: number = 0;
  yearsInstalled: number = 0;
  amc: number = 0;
  asc: number = 0;
  noOfLowSkilledLabours: number = 0;
  noOfSemiSkilledLabours: number = 0;
  noOfSkilledLabours: number = 0;
  specialSkilledLabours: number = 0;
  avgUtilization: number = 0;
  inputedInterestCost: number = 0;
  depreciationCost: number = 0;
  laborCost: number = 0;
  powerCost: number = 0;
  rentCost: number = 0;
  maintenanceCost: number = 0;
  suppliesCost: number = 0;
  burdenedCost: number = 0;
}

export enum MachineType {
  Automatic = 1,
  SemiAuto = 2,
  Manual = 3,
}
export enum MachineTypeName {
  Automatic = 'Automatic',
  SemiAuto = 'Semi-Automatic',
  Manual = 'Manual',
}

export const MachineTypePercentage = {
  [MachineType.Automatic]: {
    [MachineType.Automatic]: 1,
    [MachineType.SemiAuto]: 0.92,
    [MachineType.Manual]: 0.8,
  },
  [MachineType.SemiAuto]: {
    [MachineType.Automatic]: 1.25,
    [MachineType.SemiAuto]: 1.15,
    [MachineType.Manual]: 1,
  },
  [MachineType.Manual]: {
    [MachineType.Automatic]: 1.25,
    [MachineType.SemiAuto]: 1.15,
    [MachineType.Manual]: 1,
  },
};

export enum CabType {
  SolidCore = 1,
  Multiconductor = 2,
  ShieldedTwistedPair = 3,
  UnsheldedTwistedPair = 4,
  CoAxial = 5,
  ThermalBraidedShelded = 6,
}

export enum WorkPiece {
  UpsettingWithoutFlash = 1,
  UpsettingWithFlash = 2,
  CDFSimpleWithflashOne = 3,
  CDFSimpleWithflashTwo = 4,
  CDFComplexWithFlashOne = 5,
  CDFComplexWithFlashTwo = 6,
}
