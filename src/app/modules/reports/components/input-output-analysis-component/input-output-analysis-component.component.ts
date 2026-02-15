import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as pbi from 'powerbi-client';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService } from 'src/app/shared/services';
import { inputOutputAnalysisReportName } from 'src/app/shared/constants';
import { ReportModel } from 'src/app/modules/settings/models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-output-analysis-component',
  templateUrl: './input-output-analysis-component.component.html',
  styleUrls: ['./input-output-analysis-component.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class InputOutputAnalysisComponentComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private inputOutputAnalysisReport?: ReportModel;

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
          this.inputOutputAnalysisReport = this.config.configuration.reports?.find((r) => r.reportName === inputOutputAnalysisReportName);
          this.showReport(result.embedToken);
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.inputOutputAnalysisReport) return;
    const embedUrl = this.inputOutputAnalysisReport.reportUrl;
    const embedReportId = this.inputOutputAnalysisReport.reportIdentifier;
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
