import { Injectable } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AuthenticationHelperService } from '../helpers/authentication-helper.service';

@Injectable({
  providedIn: 'root',
})
export class BlockUiService {
  @BlockUI() blockUI: NgBlockUI;

  constructor(public _authenticationHelperService: AuthenticationHelperService) {
    sessionStorage.setItem('blockUICount', '0');
  }

  blockUIAngular() {
    this.blockUI.start('Loading...');
  }
  unBlockUIAngular() {
    setTimeout(() => {
      this.blockUI.reset();
      this.blockUI.stop();
      this.resetBlockUICounter();
    });
  }

  public pushBlockUI(serviceName: string) {
    let pushCount: number = this.blockUICount;
    console.log('pushCount : ' + (this.blockUICount + 1 + ':' + serviceName));
    ++pushCount;
    this.blockUICount = pushCount;
    this.blockUIAngular();
  }

  public popBlockUI(serviceName: string) {
    let popCount: number = this.blockUICount;
    popCount = popCount > 0 ? --popCount : 0;
    this.blockUICount = popCount;
    console.log('popCount after : ' + this.blockUICount + ':' + serviceName);
    if (popCount <= 0) {
      this.unBlockUIAngular();
    }
  }

  public resetBlockUICounter() {
    this.blockUICount = 0;
  }

  get blockUICount(): number {
    const count = sessionStorage.getItem('blockUICount') || 0;
    return +count;
  }

  set blockUICount(blockCount: number) {
    if (!blockCount.toString()) {
      sessionStorage.removeItem('blockUICount');
    } else {
      sessionStorage.setItem('blockUICount', blockCount.toString());
    }
  }
}
