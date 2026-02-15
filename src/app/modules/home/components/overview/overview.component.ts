import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as pbi from 'powerbi-client';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmbedParametersDto } from 'src/app/shared/models/embed-powerbi.model';
import { AppConfigurationService } from 'src/app/shared/services';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { executiveOverviewReportName } from 'src/app/shared/constants/constant';
import { ReportModel } from 'src/app/modules/settings/models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class OverviewComponent implements OnInit, OnDestroy {
  public screenHeight: number;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private executiveOverviewReport?: ReportModel;

  @ViewChild('reportContainer', { static: true }) reportContainer: ElementRef;
  constructor(
    private overviewService: OverviewService,
    private config: AppConfigurationService,
    private userService: UserInfoService
  ) {}

  ngOnInit(): void {
    //this.userService.getCurrentUser();
    this.screenHeight = window.screen.height;
    this.overviewService
      .getPowerBiAccessToken()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: EmbedParametersDto) => {
        if (result?.embedToken) {
          this.userService.getUserValue().subscribe((user) => {
            this.executiveOverviewReport = this.config.configuration.reports?.find((r) => r.reportName === executiveOverviewReportName);
            if (user != null && user != undefined && this.executiveOverviewReport) {
              setTimeout(() => {
                this.showReport(result.embedToken);
              }, 20);
            }
          });
        }
      });
  }

  showReport(accessToken: any) {
    // Embed URL
    if (!this.executiveOverviewReport) return;
    const embedUrl = this.executiveOverviewReport.reportUrl;
    const embedReportId = this.executiveOverviewReport.reportIdentifier;
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
