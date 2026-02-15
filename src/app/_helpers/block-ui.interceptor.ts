import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BlockUiService } from '../shared/services/block-ui.service';

@Injectable()
export class BlockUiInterceptor implements HttpInterceptor {
  constructor(private blockUiService: BlockUiService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url.toLowerCase();
    const blockableEndpoints = [
      '/bulocation',
      '/vendor',
      '/materialmaster',
      '/unspscmaster',
      '/htsmaster',
      '/projectinfo',
      '/partinfo',
      '/projectscenario',
      '/materialinfo',
      '/processinfo',
      '/costtooling',
      '/billofmaterial',
      '/cotsinfo',
      '/costsummary',
      '/logistics',
      '/overheadprofit',
      '/packinginfo',
      '/secondaryprocess',
      '/dutiestariff',
      '/spendclassification',
      '/commentfield',
      '/cncplanemodel',
      '/medbmaster',
      '/digitalfactory',
      '/dfsupplierdirectorymaster',
    ];
    const shouldBlock = blockableEndpoints.find((endpoint) => url.includes(endpoint) && !url.includes('projectfieldproperties'));
    if (shouldBlock) {
      this.blockUiService.pushBlockUI(shouldBlock);
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (shouldBlock) {
          this.blockUiService.popBlockUI(shouldBlock);
          // setTimeout(() => this.blockUiService.popBlockUI(req.url), 1000);
        }
      })
    );
  }
}
