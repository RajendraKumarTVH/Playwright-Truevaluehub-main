import type Highcharts from 'highcharts/esm/highcharts';
const today = new Date();
const nextMonth = today.getMonth() + 2;
const year = today.getFullYear() + (nextMonth > 12 ? 1 : 0);
const month = nextMonth % 12;
const startDateTimestamp = Date.UTC(year, month, 1);

export const columnChartOptions: Highcharts.Options = {
  chart: {
    type: 'column',
    style: {
      fontFamily: 'Poppins, sans-serif',
    },
  },
  title: {
    text: '',
    style: {
      fontFamily: 'Poppins, sans-serif',
    },
  },

  plotOptions: {
    column: {
      stacking: 'normal',
      grouping: false,
      groupPadding: 0, // space between column groups (categories)
      pointPadding: 0, // space between columns in the same group
      borderWidth: 0, // removes border for cleaner look
      maxPointWidth: 35, // optional, limit max column width
      dataLabels: {
        enabled: false,
        style: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
  },

  xAxis: {
    categories: [],
    labels: {
      enabled: true,
      style: {
        fontFamily: 'Poppins, sans-serif',
      },
    },
    lineWidth: 1,
    lineColor: '#A6A6A6',
    tickLength: 0,
  },

  yAxis: [
    {
      title: {
        text: 'Price ($)',
        style: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
      labels: {
        style: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
      min: 0,
      gridLineWidth: 0,
      lineWidth: 1,
      lineColor: '#A6A6A6',
      tickLength: 8,
      tickWidth: 1,
      tickColor: '#DCDCDC',
    },
    {
      title: {
        text: 'ESG (kgCO2)',
        style: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
      labels: {
        style: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
      min: 0,
      opposite: true,
      gridLineWidth: 0,
      lineWidth: 1,
      lineColor: '#A6A6A6',
      tickLength: 8,
      tickWidth: 1,
      tickColor: '#DCDCDC',
    },
  ],

  tooltip: {
    shared: true,
    backgroundColor: '#000000',
    style: {
      fontFamily: 'Poppins, sans-serif',
      color: '#ffffff',
    },
  },

  legend: {
    enabled: true,
    verticalAlign: 'top',
    align: 'center',
    symbolWidth: 16,
    symbolHeight: 16,
    symbolRadius: 0,
    itemStyle: {
      fontSize: '12px',
      fontFamily: 'Poppins, sans-serif',
      lineHeight: '16px',
    },
    itemMarginBottom: 0,
    itemMarginTop: 0,
    symbolPadding: 5,
  },

  credits: {
    enabled: false,
  },
  exporting: {
    enabled: false,
  },
  series: [
    { name: 'Material(s)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'Process(s)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'Tooling ($)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'OHP($)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'Packaging($)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'Logistics($)', type: 'column', data: [0], stack: 'COST', yAxis: 0 },
    { name: 'Total ESG (kgCO2)', type: 'column', data: [0], stack: 'ESG', yAxis: 1 },
  ],
};

export const barChartOptions: Highcharts.Options = {
  chart: {
    backgroundColor: 'transparent',
    type: 'bar',
    style: {
      fontFamily: 'Poppins, sans-serif',
    },
  },
  title: {
    text: '',
  },
  xAxis: {
    categories: [],
    title: {
      text: '',
    },
    lineWidth: 0,
    gridLineWidth: 0,
    labels: {
      enabled: true,
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: '',
      align: 'high',
    },
    labels: {
      enabled: false,
      overflow: 'justify',
    },
    lineWidth: 0,
    gridLineWidth: 0,
    lineColor: 'transparent',
  },
  tooltip: {
    valuePrefix: '% ',
    backgroundColor: 'black',
    style: {
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
    },
    borderRadius: 2,
    borderWidth: 0,
  },

  plotOptions: {
    bar: {
      colorByPoint: false,
      borderWidth: 0,
      borderRadius: 0,
      pointWidth: 18,
      groupPadding: 0.1,
      pointPadding: 0,
      dataLabels: {
        enabled: true,
      },
    },
  },
  colors: ['#ABBFE4'],
  legend: {
    enabled: false,
  },
  exporting: {
    enabled: false,
  },
  series: [
    {
      name: '',
      type: 'bar',
      data: [],
    },
  ],
};

export const stockChartOptions: Highcharts.Options = {
  title: {
    text: '',
    style: {
      textOutline: 'none',
    },
  },
  rangeSelector: {
    verticalAlign: 'top',
    buttonSpacing: 4,
    inputEnabled: true,
    inputBoxBorderColor: '#E2E2E2',
    inputBoxHeight: 24,
    inputBoxWidth: 100,
    allButtonsEnabled: true,
    inputStyle: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '12px',
    },
    buttons: [
      {
        type: 'ytd',
        text: 'YTD',
      },
      {
        type: 'year',
        count: 1,
        text: '1Y',
      },
      {
        type: 'year',
        count: 3,
        text: '3Y',
      },
      {
        type: 'year',
        count: 5,
        text: '5Y',
      },

      {
        type: 'all',
        text: 'All',
      },
    ],
    selected: 4,
  },
  chart: {
    type: 'stockChart',
    backgroundColor: '#ffffff',
    height: 500,
    spacingTop: 30,
    zooming: {
      type: 'xy',
      mouseWheel: true,
    },
    style: {
      fontFamily: 'Poppins, sans-serif',
    },
  },
  xAxis: {
    lineWidth: 1,
    lineColor: '#A6A6A6',
    tickColor: '#DCDCDC',
    gridLineWidth: 1,
    gridLineColor: '#DCDCDC',
    gridLineDashStyle: 'Dash',
    type: 'datetime',
    crosshair: {
      dashStyle: 'Solid',
      width: 1,
      color: 'black',
      label: {
        enabled: true,
        backgroundColor: 'black',
        style: {
          color: 'white',
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
  },
  yAxis: {
    min: 0,
    lineWidth: 1,
    lineColor: '#A6A6A6',
    tickWidth: 1,
    tickColor: '#DCDCDC',
    gridLineWidth: 1,
    gridLineColor: '#DCDCDC',
    gridLineDashStyle: 'Dash',
    labels: {
      formatter: function () {
        return ' $' + this.value;
      },
    },
    minPadding: 20,
    opposite: false,
    showLastLabel: true,
    crosshair: {
      dashStyle: 'Solid',
      width: 1,
      color: 'black',
    },
    title: {
      text: '',
    },
  },
  tooltip: {
    backgroundColor: 'black',
    style: {
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
    },
    borderRadius: 2,
    borderWidth: 0,
    useHTML: true,
    formatter: function () {
      return `
      <span>Price: <span style="color:#3F83F9; font-weight:500;">
         $${this.y?.toFixed(4)}
      </span> </span>
    `;
    },
  },
  exporting: {
    enabled: false,
  },
  series: [
    {
      type: 'line',
      name: 'Price',
      marker: {
        enabled: true,
        radius: 4,
        symbol: 'circle',
      },
      dataLabels: {
        enabled: true,
        formatter: function () {
          const allValues = this.series.data.filter(Boolean).map((p) => p.y);
          const minVal = Math.min(...allValues);
          const maxVal = Math.max(...allValues);
          if (this.y === minVal) {
            return '<span style="color: #2BA746; font-weight: 500;">Min: $ ' + this.y + '</span>';
          } else if (this.y === maxVal) {
            return '<span style="color: #ED3333; font-weight: 500;">Max: $ ' + this.y + '</span>';
          }
          return null;
        },
      },
      color: '#3F83F9',
      data: [],
      tooltip: {
        valueDecimals: 4,
      },
      zoneAxis: 'x',
      zones: [
        {
          value: startDateTimestamp,
        },
        {
          dashStyle: 'Dot',
        },
      ],
    },
  ],
};
