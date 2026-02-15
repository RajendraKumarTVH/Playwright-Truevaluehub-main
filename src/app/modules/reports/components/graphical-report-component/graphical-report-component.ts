import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as pbi from 'powerbi-client';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService } from 'src/app/shared/services';
import { graphicalReportName } from 'src/app/shared/constants';
import { ReportModel } from 'src/app/modules/settings/models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-graphical-report-component',
  templateUrl: './graphical-report-component.html',
  styleUrls: ['./graphical-report-component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class GraphicalReportComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private graphicalCostReport?: ReportModel;

  @ViewChild('reportContainer', { static: true }) reportContainer: ElementRef;
  reportPrint: any;
  constructor(
    private overviewService: OverviewService,
    private config: AppConfigurationService
  ) {}

  ngOnInit(): void {
    this.screenHeight = window.screen.height;
    this.overviewService
      .getPowerBiAccessToken()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: EmbedParametersDto) => {
        if (result?.embedToken) {
          this.graphicalCostReport = this.config.configuration.reports?.find((r) => r.reportName === graphicalReportName);
          this.showReport(result.embedToken);
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.graphicalCostReport) return;
    const embedUrl = this.graphicalCostReport.reportUrl;
    const embedReportId = this.graphicalCostReport.reportIdentifier;
    const config = {
      type: 'report',
      tokenType: pbi.models.TokenType.Aad,
      accessToken: accessToken,
      embedUrl: embedUrl,
      id: embedReportId,
      permissions: pbi.models.Permissions.All,
      viewMode: pbi.models.ViewMode.View,
      settings: {
        localeSettings: {
          language: 'en',
          formatLocale: 'en',
          persistentFiltersEnabled: true,
        },
        persistentFiltersEnabled: true,
      },
    };
    const reportContainer = this.reportContainer.nativeElement;
    const powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
    const report = powerbi.embed(reportContainer, config);
    report.off('loaded');
    report.on('loaded', () => {
      console.log('Loaded');
    });
    report.on('error', () => {});
  }

  print() {
    const reportContainer = this.reportContainer.nativeElement;
    const powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
    this.reportPrint = powerbi.get(reportContainer);
    this.reportPrint.print().catch((error: any) => {
      console.log(error);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
