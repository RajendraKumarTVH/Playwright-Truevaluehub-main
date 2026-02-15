import { Injectable } from '@angular/core';

declare global {
  interface Window {
    ZohoDeskAsapReady?: (callback: () => void) => void;
    ZohoDeskAsapReadyStatus?: boolean;
    ZohoDeskAsap__asyncalls?: (() => void)[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class ZohoDeskService {
  private readonly SCRIPT_ID = 'zohodeskasap';

  load(scriptSrc: string, nonce?: string): void {
    // Avoid duplicate loads
    if (document.getElementById(this.SCRIPT_ID)) {
      return;
    }

    // Setup Zoho callback queue (same as original script)
    window.ZohoDeskAsapReady = (cb: () => void) => {
      const queue = (window.ZohoDeskAsap__asyncalls = window.ZohoDeskAsap__asyncalls || []);

      if (window.ZohoDeskAsapReadyStatus) {
        cb && queue.push(cb);
        queue.forEach((fn) => fn && fn());
        window.ZohoDeskAsap__asyncalls = [];
      } else {
        cb && queue.push(cb);
      }
    };

    const script = document.createElement('script');
    script.id = this.SCRIPT_ID;
    script.type = 'text/javascript';
    script.defer = true;
    script.src = scriptSrc;

    if (nonce) {
      script.setAttribute('nonce', nonce);
    }

    document.body.appendChild(script);
  }
}
