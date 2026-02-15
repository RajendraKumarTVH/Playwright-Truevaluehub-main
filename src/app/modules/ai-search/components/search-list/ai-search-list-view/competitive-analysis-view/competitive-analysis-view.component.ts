import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as Highcharts from 'highcharts';
import { AiSearchHelperBase } from 'src/app/modules/ai-search/services/ai-search-helper-base';
import { AiSearchService } from 'src/app/shared/services/ai-search.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { Store } from '@ngxs/store';
import { AiSearchHelperService } from 'src/app/modules/ai-search/services/ai-search-helper-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { BlockUiService } from 'src/app/shared/services';
type ViewMode = 'supplier' | 'category' | 'material' | 'region';
interface PartBubble {
  intPartNumber: string;
  supplier: string;
  category: string;
  material: string;
  region: string;
  shouldCost: number; // x
  purchasePrice: number; // y
  annualSpend: number; // z (bubble size)
}

@Component({
  selector: 'app-competitive-analysis-view',
  imports: [CommonModule, HighchartsChartComponent, MatButtonModule, MatIconModule],
  templateUrl: './competitive-analysis-view.component.html',
  styleUrl: './competitive-analysis-view.component.scss',
})
export class CompetitiveAnalysisViewComponent extends AiSearchHelperBase implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; // optional, if you want to bind it

  activeView: ViewMode = 'supplier';
  showDetails = false;

  // color per group name (supplier / category / material / region)
  private readonly colorMap: Record<string, string> = {
    'Stellar Industries': '#A1B5FF',
    'NovelTech Solutions': '#587CC6',
    'Zenith Dynamics': '#FF7E65',
    'Apex Corp': '#5ED1B1',
    'Orion Corp': '#FFB024',
    'Teek Technology': '#E54C71',

    Machined: '#A1B5FF',
    Cast: '#587CC6',
    Forged: '#FF7E65',

    Steel: '#A1B5FF',
    Aluminium: '#587CC6',
    Alloy: '#FF7E65',

    Asia: '#A1B5FF',
    Europe: '#587CC6',
    'North America': '#FF7E65',
  };

  // dummy parts – each row is one bubble
  private readonly parts: PartBubble[] = [
    {
      intPartNumber: 'P-10234',
      supplier: 'Stellar Industries',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 40,
      purchasePrice: 70,
      annualSpend: 120,
    },
    {
      intPartNumber: 'P-20411',
      supplier: 'Stellar Industries',
      category: 'Cast',
      material: 'Aluminium',
      region: 'Europe',
      shouldCost: 55,
      purchasePrice: 85,
      annualSpend: 150,
    },
    {
      intPartNumber: 'P-30812',
      supplier: 'NovelTech Solutions',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 35,
      purchasePrice: 55,
      annualSpend: 90,
    },
    {
      intPartNumber: 'P-50123',
      supplier: 'NovelTech Solutions',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 60,
      purchasePrice: 95,
      annualSpend: 180,
    },
    {
      intPartNumber: 'P-50123',
      supplier: 'Zenith Dynamics',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 60,
      purchasePrice: 95,
      annualSpend: 180,
    },
    {
      intPartNumber: 'P-50123',
      supplier: 'Apex Corp',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 60,
      purchasePrice: 95,
      annualSpend: 180,
    },
    {
      intPartNumber: 'P-50123',
      supplier: 'Apex Corp',
      category: 'Forged',
      material: 'Alloy',
      region: 'Galactic Enterprises',
      shouldCost: 60,
      purchasePrice: 95,
      annualSpend: 180,
    },
    {
      intPartNumber: 'P-30812',
      supplier: 'Orion Corp',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 35,
      purchasePrice: 55,
      annualSpend: 90,
    },
    {
      intPartNumber: 'P-30812',
      supplier: 'Teek Technology',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 35,
      purchasePrice: 55,
      annualSpend: 90,
    },
    {
      intPartNumber: 'P-70110',
      supplier: 'Stellar Industries',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 15,
      purchasePrice: 10,
      annualSpend: 60,
    },
    {
      intPartNumber: 'P-70111',
      supplier: 'Stellar Industries',
      category: 'Cast',
      material: 'Aluminium',
      region: 'Europe',
      shouldCost: 25,
      purchasePrice: 20,
      annualSpend: 80,
    },
    {
      intPartNumber: 'P-70112',
      supplier: 'NovelTech Solutions',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 30,
      purchasePrice: 30,
      annualSpend: 70,
    },
    {
      intPartNumber: 'P-70113',
      supplier: 'NovelTech Solutions',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 45,
      purchasePrice: 35,
      annualSpend: 140,
    },
    {
      intPartNumber: 'P-70114',
      supplier: 'Zenith Dynamics',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 55,
      purchasePrice: 40,
      annualSpend: 160,
    },
    {
      intPartNumber: 'P-70115',
      supplier: 'Zenith Dynamics',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 70,
      purchasePrice: 45,
      annualSpend: 190,
    },
    {
      intPartNumber: 'P-70116',
      supplier: 'Apex Corp',
      category: 'Cast',
      material: 'Aluminium',
      region: 'Europe',
      shouldCost: 80,
      purchasePrice: 30,
      annualSpend: 130,
    },
    {
      intPartNumber: 'P-70117',
      supplier: 'Apex Corp',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 95,
      purchasePrice: 35,
      annualSpend: 210,
    },
    {
      intPartNumber: 'P-70118',
      supplier: 'Orion Corp',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 110,
      purchasePrice: 30,
      annualSpend: 230,
    },
    {
      intPartNumber: 'P-70119',
      supplier: 'Orion Corp',
      category: 'Forged',
      material: 'Alloy',
      region: 'North America',
      shouldCost: 125,
      purchasePrice: 40,
      annualSpend: 260,
    },
    {
      intPartNumber: 'P-70120',
      supplier: 'Teek Technology',
      category: 'Machined',
      material: 'Steel',
      region: 'Asia',
      shouldCost: 135,
      purchasePrice: 18,
      annualSpend: 150,
    },
    {
      intPartNumber: 'P-70121',
      supplier: 'Teek Technology',
      category: 'Cast',
      material: 'Aluminium',
      region: 'Europe',
      shouldCost: 145,
      purchasePrice: 38,
      annualSpend: 220,
    },
    {
      intPartNumber: 'P-70121',
      supplier: 'Teek Technology',
      category: 'Cast',
      material: 'Aluminium',
      region: 'Europe',
      shouldCost: 140,
      purchasePrice: 38,
      annualSpend: 220,
    },
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bubble',
      backgroundColor: 'transparent',
      plotBorderWidth: 1,
    },
    exporting: {
      enabled: false,
    },
    title: { text: '' },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
    },
    xAxis: {
      title: {
        text: 'Should Cost ($)',
        style: {
          color: '#333333',
          fontSize: '12px',
          fontWeight: '500',
          fontFamily: 'Poppins, sans-serif',
        },
      },
      min: 0,
      max: 150,
      gridLineWidth: 1,
      gridLineDashStyle: 'Dash',
      gridLineColor: '#D2D2D2',
      lineWidth: 1,
      tickWidth: 0,
      labels: {
        style: { color: '#000000', fontSize: '12px', fontFamily: 'Poppins, sans-serif' },
      },
    },
    yAxis: {
      title: {
        text: 'Purchase Price ($)',
        style: {
          color: '#333333',
          fontSize: '12px',
          fontWeight: '500',
          fontFamily: 'Poppins, sans-serif',
        },
      },
      min: 0,
      max: 50,
      tickPositions: [0, 10, 20, 30, 40, 50], // ticks at $10, $20, $30, $40, $50
      gridLineWidth: 1,
      gridLineDashStyle: 'Dash',
      gridLineColor: '#D2D2D2',
      labels: {
        formatter: function () {
          return `$${this.value}`;
        },
        style: { color: '#000000', fontSize: '12px', fontFamily: 'Poppins, sans-serif' },
      },
    },
    tooltip: {
      backgroundColor: 'black',
      style: {
        color: 'white',
        fontFamily: 'Poppins, sans-serif',
      },
      borderRadius: 2,
      borderWidth: 0,
      useHTML: true,
      headerFormat: '',
      pointFormat: '<span style="font-size:11px;font-weight:600;">{point.name}</span><br/>' + '<span>Should Cost: <b>${point.x}</b></span><br/>',
    },
    plotOptions: {
      bubble: {
        minSize: 10,
        maxSize: 70,
        marker: { fillOpacity: 0.8 },
      },
      series: {
        dataLabels: { enabled: false },
      },
    },
    series: [], // will be filled in constructor
  };

  constructor(
    readonly searchService: AiSearchService,
    readonly sharedService: SharedService,
    readonly userService: UserService,
    readonly userInfoService: UserInfoService,
    readonly messaging: MessagingService,
    readonly _store: Store,
    readonly searchHelperService: AiSearchHelperService,
    readonly modalService: NgbModal,
    readonly matDialog: MatDialog,
    readonly digitalFactoryService: DigitalFactoryService,
    readonly blockUiService: BlockUiService
  ) {
    super(userInfoService, userService, _store, searchService, messaging, sharedService, modalService, matDialog, digitalFactoryService, blockUiService);
    // this.updateChartForView(this.activeView);
  }

  ngOnInit(): void {
    this.loadDataSource();
  }

  changeView(view: ViewMode): void {
    if (this.activeView === view) return;
    this.updateChartForView(view);
  }

  protected loadDataSource(): void {
    this.loadListingPartData();
  }

  protected afterLoadDataSource(): void {
    this.updateChartForView(this.activeView);
  }

  private updateChartForView(view: ViewMode): void {
    this.activeView = view;

    // group parts by the selected field (supplier / category / material / region)
    const grouped = new Map<string, Highcharts.PointOptionsObject[]>();

    for (const p of this.parts) {
      // let key: string;
      // if (view === 'supplier') {
      //   key = 'vendorId';
      // }
      const key = (p as any)[view] as string; // simple indexing for demo
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push({
        x: p.shouldCost,
        y: p.purchasePrice ?? 0,
        z: p.annualSpend,
        name: p.intPartNumber, // bubble tooltip label = part
      });
    }

    const bubbleSeries: Highcharts.SeriesOptionsType[] = Array.from(grouped.entries()).map(([name, data]) => ({
      type: 'bubble',
      name, // legend = group name (supplier / category / material / region)
      data,
      color: this.colorMap[name] || undefined, // use mapped color if available
    }));
    const diagonalSeries: Highcharts.SeriesOptionsType = {
      type: 'line',
      name: 'Baseline',
      data: [
        [0, 0], // xMin, yMin
        [150, 50], // xMax, yMax  (match your xAxis.max & yAxis.max)
      ],
      color: '#6C6C6D',
      dashStyle: 'Dash',
      enableMouseTracking: false,
      marker: { enabled: false },
      showInLegend: false,
    };

    // reassign chartOptions so HighchartsAngular detects change
    this.chartOptions = {
      ...this.chartOptions,
      series: [...bubbleSeries, diagonalSeries],
    };
  }
}
