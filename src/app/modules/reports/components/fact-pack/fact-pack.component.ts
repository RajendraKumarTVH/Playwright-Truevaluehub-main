import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReportModel } from 'src/app/modules/settings/models';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService, OverviewService } from 'src/app/shared/services';
import * as pbi from 'powerbi-client';
import { factPackReportName } from 'src/app/shared/constants';

@Component({
  selector: 'app-fact-pack',
  templateUrl: './fact-pack.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class FactPackComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private factPackReport?: ReportModel;

  @ViewChild('reportContainer', { static: true }) reportContainer: ElementRef;
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
          this.factPackReport = this.config.configuration.reports?.find((r) => r.reportName === factPackReportName);
          this.showReport(result.embedToken);
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.factPackReport) return;
    const embedUrl = this.factPackReport.reportUrl;
    const embedReportId = this.factPackReport.reportIdentifier;
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

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
