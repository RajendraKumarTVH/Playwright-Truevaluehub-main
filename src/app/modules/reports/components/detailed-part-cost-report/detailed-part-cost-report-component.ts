import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as pbi from 'powerbi-client';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService } from 'src/app/shared/services';
import { detailedPartCostReportName } from 'src/app/shared/constants';
import { ReportModel } from 'src/app/modules/settings/models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-detailed-part-cost-report',
  templateUrl: './detailed-part-cost-report.html',
  styleUrls: ['./detailed-part-cost-report.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class DetailedPartCostReportComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private detailedPartCostReport?: ReportModel;

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
          this.detailedPartCostReport = this.config.configuration.reports?.find((r) => r.reportName === detailedPartCostReportName);
          this.showReport(result.embedToken);
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.detailedPartCostReport) return;
    const embedUrl = this.detailedPartCostReport.reportUrl;
    const embedReportId = this.detailedPartCostReport.reportIdentifier;
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
