import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as pbi from 'powerbi-client';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportModel } from 'src/app/modules/settings/models';
import { matertialReportName } from 'src/app/shared/constants';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService, OverviewService } from 'src/app/shared/services';

@Component({
  selector: 'app-material-report-component',
  templateUrl: './material-report-component.html',
  styleUrls: ['./material-report-component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class MaterialReportComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private materialReport?: ReportModel;

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
          this.materialReport = this.config.configuration.reports?.find((r) => r.reportName === matertialReportName);
          this.showReport(result.embedToken);
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.materialReport) return;
    const embedUrl = this.materialReport.reportUrl;
    const embedReportId = this.materialReport.reportIdentifier;
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
