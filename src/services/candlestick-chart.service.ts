import { Injectable } from '@angular/core';
import {createChart, IChartApi, ISeriesApi, UTCTimestamp} from 'lightweight-charts';

@Injectable({
  providedIn: 'root',
})
export class CandlestickChartService {
  private chart!: IChartApi;
  private candlestickSeries!: ISeriesApi<'Candlestick'>;

  initChart(container: HTMLElement): void {
    this.chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 400,
      layout: {
        background: { color: '#0E1218FF' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
    });

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: 'rgba(20,194,151,255)',
      downColor: 'rgba(255,105,89,255)',
      borderDownColor: 'rgba(255,105,89,255)',
      borderUpColor: 'rgba(20,194,151,255)',
      wickDownColor: 'rgba(255,105,89,255)',
      wickUpColor: 'rgba(20,194,151,255)',
    });
  }

  setCandlestickData(data: any[]): void {
    const transformedData = data.map(item => {
      const date = new Date(item.t);
      const unixTimestamp = Math.floor(date.getTime() / 1000) as UTCTimestamp;

      return {
        time: unixTimestamp,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
      };
    });

    this.candlestickSeries.setData(transformedData);
    this.chart.timeScale().fitContent();
  }
}
