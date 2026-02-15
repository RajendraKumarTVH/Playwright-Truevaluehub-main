import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { AppConfiguration, BaseConfiguration, DefaultConfiguration } from './app-configuration';
import { tap } from 'rxjs/operators';
import { ReportModel } from 'src/app/modules/settings/models';

@Injectable({ providedIn: 'root' })
export class AppConfigurationService implements OnDestroy {
  private readonly configurationSubject: ReplaySubject<BaseConfiguration>;
  public configuration: BaseConfiguration;

  constructor(private httpClient: HttpClient) {
    this.configuration = new BaseConfiguration(new DefaultConfiguration());
    this.configurationSubject = new ReplaySubject<BaseConfiguration>(1);
  }

  ngOnDestroy(): void {
    this.configurationSubject.complete();
  }

  getConfiguration(): Observable<BaseConfiguration> {
    return this.configurationSubject.asObservable();
  }

  loadConfigurationData(url: string): Promise<AppConfiguration> {
    return this.httpClient
      .get<AppConfiguration>(url)
      .pipe(
        tap((config: AppConfiguration) => {
          this.configuration = new BaseConfiguration(config);
          this.configurationSubject.next(this.configuration);
        })
      )
      .toPromise();
  }

  loadPowerBIConfigData(numberOfDecimalPlaces: number, reports: ReportModel[]) {
    this.getConfiguration().subscribe((powerbi) => {
      powerbi.numberOfDecimals = numberOfDecimalPlaces;
      powerbi.reports = reports;
    });
  }
}
