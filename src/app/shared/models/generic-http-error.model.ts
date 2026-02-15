import { HttpHeaders } from '@angular/common/http';
export interface IError {
  message: string;
  name: string;
  stackTrace?: any;
}

export class GenericHttpError implements IError {
  public corelationId: string;
  constructor(
    public statusCode: number,
    public name: string = '',
    public message: string = '',
    public url: string = '',
    public header: HttpHeaders,
    public stackTrace: any = null,
    public error: any = null
  ) {}
}
