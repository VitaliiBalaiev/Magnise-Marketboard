import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { RestapiService } from '../services/restapi.service';
import { WatchlistService } from '../services/watchlist.service';
import { CandlestickChartService } from '../services/candlestick-chart.service';
import { Asset } from '../models/asset.model';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ]
})
export class OverviewComponent implements OnInit, OnDestroy {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  selectedAsset: Asset | undefined;
  providers: string[] = [];
  selectedProvider: string | null = null;
  searchQuery: string = '';
  isDropdownOpen: boolean = false;
  subscriptionIdCounter: number = 1;

  timeframes = [
    { label: '1 Minute', interval: 1, periodicity: 'minute' },
    { label: '1 Hour', interval: 1, periodicity: 'hour' },
    { label: '1 Day', interval: 1, periodicity: 'day' },
    { label: '1 Week', interval: 7, periodicity: 'day' },
    { label: '1 Month', interval: 30, periodicity: 'day' },
    { label: '1 Year', interval: 1, periodicity: 'year' },
  ];

  constructor(
    private restApiService: RestapiService,
    private websocketService: WebsocketService,
    private watchlistService: WatchlistService,
    private candlestickChartService: CandlestickChartService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.loadAssets();
    this.websocketService.initialize();
    this.websocketService.getMessage().subscribe((message) => this.handleAssetData(message));

    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      this.candlestickChartService.initChart(chartContainer);
    }
  }

  ngOnDestroy(): void {
    if (this.selectedAsset) {
      this.unsubscribeFromAsset(this.selectedAsset);
    }
    this.selectedAsset = undefined;
  }

  async loadProviders(): Promise<void> {
    try {
      this.providers = await this.restApiService.fetchProviders();
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  }

  async loadAssets(): Promise<void> {
    try {
      this.assets = await this.restApiService.fetchAssetInstruments();
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterAssets(): void {
    this.filteredAssets = this.assets.filter(
      (asset) =>
        (!this.selectedProvider || asset.provider === this.selectedProvider) &&
        (!this.searchQuery || asset.instrument.symbol.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  onProviderSelect(provider: string): void {
    if (this.selectedProvider === provider) {
      this.selectedProvider = null;
      this.filteredAssets = this.assets;
    } else {
      this.selectedProvider = provider;
      this.filteredAssets = this.assets.filter(asset => asset.provider === provider);
    }
  }

  onAssetSelect(asset: Asset): void {
    if (this.selectedAsset) {
      this.unsubscribeFromAsset(this.selectedAsset);
    }

    this.selectedAsset = asset;
    this.subscribeToAsset(asset);
    this.loadCandlestickData(asset.instrument.id, asset.provider, 1, 'minute');
    this.isDropdownOpen = false;
  }

  subscribeToAsset(asset: Asset): void {
    const message = {
      type: 'l1-subscription',
      id: (this.subscriptionIdCounter++).toString(),
      instrumentId: asset.instrument.id,
      provider: asset.provider,
      subscribe: true,
      kinds: ['last'],
    };
    this.websocketService.sendMessage(message);
  }

  unsubscribeFromAsset(asset: Asset): void {
    const message = {
      type: 'l1-subscription',
      id: (this.subscriptionIdCounter++).toString(),
      instrumentId: asset.instrument.id,
      provider: asset.provider,
      subscribe: false,
      kinds: ['last'],
    };
    this.websocketService.sendMessage(message);

  }

  handleAssetData(message: any): void {
    if (this.selectedAsset != undefined) {
      if (message.type === 'l1-update' && message.last) {
        this.selectedAsset!.price = message.last.price;
        this.selectedAsset!.timestamp = message.last.timestamp;
        this.selectedAsset!.change = message.last.change;
        this.selectedAsset!.changePct = message.last.changePct;
      }
    }
  }

  addToWatchlist(): void {
    if (this.selectedAsset) {
      const item = {
        instrumentId: this.selectedAsset.instrument.id,
        provider: this.selectedAsset.provider,
        symbol: this.selectedAsset.instrument.symbol
      };
      this.watchlistService.addToWatchlist(item);
    }
  }

  async loadCandlestickData(instrumentId: string, provider: string, interval: number, periodicity: string): Promise<void> {
    try {
      const data = await this.restApiService.fetchCandlestickData(instrumentId, provider, interval, periodicity);
      this.candlestickChartService.setCandlestickData(data);
    } catch (error) {
      console.error('Error loading candlestick data:', error);
    }
  }
}
