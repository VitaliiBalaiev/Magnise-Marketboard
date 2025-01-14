import { Injectable } from '@angular/core';
import {createChart, IChartApi, ISeriesApi, Time, UTCTimestamp} from 'lightweight-charts';
import {Candlestick} from '../models/candlestick.model';

@Injectable({
  providedIn: 'root',
})
export class CandlestickChartService {
  private chart!: IChartApi;
  private candlestickSeries!: ISeriesApi<'Candlestick'>;

  initChart(container: HTMLElement): void {
    this.chart = createChart(container, {
      width: container.offsetWidth,
      height: 400,
      layout: {
        textColor: '#000',
      },
      grid: {
        vertLines: { color: '#e1e1e1' },
        horzLines: { color: '#e1e1e1' },
      },
      timeScale: {
        borderColor: '#cccccc',
      },
    });

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: 'rgba(0, 255, 0, 0.6)',
      downColor: 'rgba(255, 0, 0, 0.6)',
      borderDownColor: 'rgba(255, 0, 0, 1)',
      borderUpColor: 'rgba(0, 255, 0, 1)',
      wickDownColor: 'rgba(255, 0, 0, 1)',
      wickUpColor: 'rgba(0, 255, 0, 1)',
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
  }
}
