import cadex from '@cadexchanger/web-toolkit';

export class ProgressStatusManager extends cadex.Base_ProgressStatusObserver {
  protected myProgressBar: HTMLDivElement;
  protected myProgressStatus: cadex.Base_ProgressStatus | null = null;

  constructor(public readonly domElement: HTMLElement = document.createElement('div')) {
    super();

    domElement.id = 'progress';
    domElement.classList.add('progress');
    this.domElement.style.visibility = 'hidden';

    this.myProgressBar = document.createElement('div');
    this.myProgressBar.classList.add('progress-bar');
    this.myProgressBar.setAttribute('role', 'progressbar');
    this.myProgressBar.setAttribute('aria-valuenow', '0');
    this.myProgressBar.style.width = '0%';
    this.myProgressBar.textContent = '0%';
    this.domElement.appendChild(this.myProgressBar);
  }

  get progressStatus() {
    return this.myProgressStatus;
  }

  init(): cadex.Base_ProgressStatus {
    if (this.myProgressStatus) {
      this.myProgressStatus.cancel();
      this.myProgressStatus.unregister(this);
    }
    this.myProgressStatus = new cadex.Base_ProgressStatus();
    this.myProgressStatus.register(this);
    this.show();
    return this.myProgressStatus;
  }

  show = () => {
    this.domElement.style.visibility = 'visible';
  };

  hide = () => {
    this.domElement.style.visibility = 'hidden';
    this.myProgressBar.style.width = '0%';
  };

  dispose() {
    if (this.myProgressStatus) {
      this.myProgressStatus.cancel();
      this.myProgressStatus.unregister(this);
    }
  }

  override changedValue(theStatus: cadex.Base_ProgressStatus) {
    this.updateUI(theStatus.value);
  }

  override completed(theStatus: cadex.Base_ProgressStatus) {
    this.updateUI(theStatus.value);
    // hide progress status with delay
    setTimeout(this.hide, 1000);
  }

  override canceled() {
    // hide progress status with delay
    setTimeout(this.hide, 1000);
  }

  private updateUI(theValue: number) {
    const progressValue = `${Math.floor(theValue)}%`;
    this.myProgressBar.style.width = progressValue;
    this.myProgressBar.textContent = progressValue;
    this.myProgressBar.setAttribute('aria-valuenow', `${Math.round(theValue)}`);
  }
}
