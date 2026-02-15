import { ReportModel } from 'src/app/modules/settings/models';

export interface AppConfiguration {
  masterApiBaseUrl: string;
  apiBaseUrl: string;
  isDevEnvironment?: boolean;
  numberOfDecimals: number;
  reports: ReportModel[];
  isProduction?: string;
  getAbsoluteApiUrl(relativeUrl: string): string;
  getAbsoluteMasterApiUrl(relativeUrl: string): string;
  getBaseUrl(): string | undefined;
  getMasterApiBaseUrl(): string | undefined;
}

export class BaseConfiguration implements AppConfiguration {
  constructor(config: AppConfiguration) {
    this.masterApiBaseUrl = config.masterApiBaseUrl;
    this.isDevEnvironment = config.isDevEnvironment;
    this.apiBaseUrl = config.apiBaseUrl;
    this.numberOfDecimals = config.numberOfDecimals;
    this.reports = config.reports;
    this.isProduction = config.isProduction;
  }
  apiBaseUrl: string;
  masterApiBaseUrl: string;
  isDevEnvironment?: boolean;
  numberOfDecimals: number;
  reports: ReportModel[];
  isProduction?: string;

  getAbsoluteApiUrl(relativeUrl: string): string {
    // const urlParts = relativeUrl.split('/');
    //this api name can be used if the API's are different for digifaas and digibrat
    // let apiName = '';
    // if (urlParts.length > 1 && urlParts[1] === 'api') {
    //   apiName = urlParts[2];
    // } else {
    //   apiName = urlParts[1];
    // }
    const baseUrl = this.getBaseUrl();
    return baseUrl + relativeUrl;
  }

  getBaseUrl(): string | undefined {
    return this.apiBaseUrl;
  }

  getAbsoluteMasterApiUrl(relativeUrl: string): string {
    // const urlParts = relativeUrl.split('/');
    //this api name can be used if the API's are different for digifaas and digibrat
    // let apiName = '';
    // if (urlParts.length > 1 && urlParts[1] === 'api') {
    //   apiName = urlParts[2];
    // } else {
    //   apiName = urlParts[1];
    // }
    const baseUrl = this.getMasterApiBaseUrl();
    return baseUrl + relativeUrl;
  }

  getMasterApiBaseUrl(): string | undefined {
    return this.masterApiBaseUrl;
  }
}

export class DefaultConfiguration implements AppConfiguration {
  constructor(public isDevEnvironment = false) {}
  reports: ReportModel[];
  apiBaseUrl: string;
  masterApiBaseUrl: string;
  numberOfDecimals: number;
  getAbsoluteApiUrl(path: string) {
    return path;
  }
  getAbsoluteMasterApiUrl(path: string) {
    return path;
  }
  getBaseUrl() {
    return '';
  }
  getMasterApiBaseUrl() {
    return '';
  }
}
