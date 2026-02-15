import * as Highcharts from 'highcharts';

export function initHighcharts() {
  Highcharts.setOptions({
    accessibility: {
      enabled: true,
    },
    credits: {
      enabled: false,
    },
    chart: {
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Poppins, sans-serif',
      },
    },
  });
}
