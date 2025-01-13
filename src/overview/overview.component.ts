import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketService} from '../services/websocket.service';
import {Instrument} from '../models/instrument.model';
import {RestapiService} from '../services/restapi.service';
import {InstrumentStoreService} from '../services/instrument-store.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WatchlistService} from '../services/watchlist.service';

@Component({
  selector: 'app-overview',
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
  ],
  templateUrl: './overview.component.html',
  standalone: true,
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  instruments: Instrument[] = [];
  selectedInstrumentId: string | null = null;
  selectedSymbol: string = '';
  selectedAsset: any = null;
  providers: string[] = [];
  selectedProvider: string = '';
  subscriptionIdCounter: number = 1;

  constructor(
    private restApiService: RestapiService,
    private instrumentStore: InstrumentStoreService,
    private websocketService: WebsocketService,
    private watchlistService: WatchlistService,
  ) {
  }

  ngOnInit(): void {
    this.loadProviders();
    this.websocketService.initialize();
    this.websocketService.getMessage().subscribe(message => this.handleAssetData(message));
  }

  async loadInstruments(provider: string) {
    try {
      await this.restApiService.fetchInstruments(provider);
      this.instruments = this.instrumentStore.getInstruments();
    } catch (error) {
      console.error('Error loading instruments', error);
    }
  }

  async loadProviders(): Promise<void> {
    try {
      this.providers = await this.restApiService.fetchProviders();
    } catch (error) {
      console.error('Error loading providers: ', error);
    }
  }

  onInstrumentSelect(): void {
    const selectedInstrument = this.instruments.find(instrument => instrument.symbol === this.selectedSymbol);

    if (selectedInstrument) {
      if (this.selectedInstrumentId !== selectedInstrument.id) {
        if (this.selectedInstrumentId) {
          const unsubscribeMessage = {
            type: 'l1-subscription',
            id: (this.subscriptionIdCounter++).toString(),
            instrumentId: this.selectedInstrumentId,
            provider: 'simulation',
            subscribe: false,
            kinds: ['last']
          };
          this.websocketService.sendMessage(unsubscribeMessage);
        }

        this.selectedInstrumentId = selectedInstrument.id;
        const message = {
          type: 'l1-subscription',
          id: (this.subscriptionIdCounter++).toString(),
          instrumentId: this.selectedInstrumentId,
          provider: 'simulation',
          subscribe: true,
          kinds: ['last']
        };
        this.websocketService.sendMessage(message);
      }
    }
  }

  handleAssetData(message: any): void {
    if (message.type === 'l1-update' && message.instrumentId === this.selectedInstrumentId) {
      const last = message.last;

      this.instruments.find(instrument => instrument.symbol === this.selectedSymbol);
      if (this.selectedAsset) {
        this.selectedAsset.symbol = this.selectedSymbol;
        this.selectedAsset.price = last.price;
        this.selectedAsset.timestamp = last.timestamp;
        this.selectedAsset.change = last.change;
        this.selectedAsset.changePct = last.changePct;
      } else {
        this.selectedAsset = {
          symbol: this.selectedSymbol,
          price: last.price,
          timestamp: last.timestamp,
          change: last.change,
          changePct: last.changePct
        };
      }

    }
  }

  addToWatchlist(): void {
    const selectedInstrument = this.instruments.find(instrument => instrument.symbol === this.selectedSymbol);
    if (selectedInstrument && this.selectedProvider) {
      this.watchlistService.addToWatchlist({
        provider: this.selectedProvider,
        instrumentId: selectedInstrument.id,
        symbol: selectedInstrument.symbol,
      });
    }
  }
}
