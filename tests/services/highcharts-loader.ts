
export class HighchartsLoaderService {
  readonly ready = signal(false);

  async load(): Promise<void> {
    if (this.ready()) return;

    await import('highcharts/esm/highcharts');
    console.log('Highcharts core loaded');
    await Promise.all([
      //import('highcharts/esm/highcharts-more'),
      import('highcharts/esm/modules/exporting'),
    ]);
    console.log('Highcharts other modules loaded');
    this.ready.set(true);
  }
}
