export interface IError {
  message: string;
  name: string;
  stackTrace?: any;
}

export class GenericHttpError implements IError {
  public corelationId: string = '';
  constructor(
    public statusCode: number,
    public name: string = '',
    public message: string = '',
    public url: string = '',
    public header: any = null,
    public stackTrace: any = null,
    public error: any = null
  ) { }
}
