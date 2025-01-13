import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WatchlistService } from '../services/watchlist.service';
import { WebsocketService } from '../services/websocket.service';
import {WatchlistItem} from '../models/watchlist-item.model';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
  imports: [
    NgForOf
  ],
  standalone: true
})
export class WatchlistComponent implements OnInit, OnDestroy {
  watchlist: WatchlistItem[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private watchlistService: WatchlistService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.watchlistService.watchlist$.subscribe(watchlist => {
        this.watchlist = watchlist;
        this.subscribeToWebSocketUpdates();
      })
    );
  }

  subscribeToWebSocketUpdates(): void {
    this.watchlist.forEach(item => {
      const message = {
        type: 'l1-subscription',
        id: item.instrumentId,
        instrumentId: item.instrumentId,
        provider: item.provider,
        subscribe: true,
        kinds: ['last'],
      };
      this.websocketService.sendMessage(message);
    });

    this.subscriptions.push(
      this.websocketService.getMessage().subscribe(message => {
        if (message.type === 'l1-update') {
          const item = this.watchlist.find(w => w.instrumentId === message.instrumentId);
          if (item) {
            item.price = message.last.price;
            item.change = message.last.change;
            item.changePct = message.last.changePct;
            item.timestamp = message.last.timestamp;
          }
        }
      })
    );
  }

  removeFromWatchlist(item: WatchlistItem): void {
    this.watchlistService.removeFromWatchlist(item);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.watchlist.forEach(item => {
      const message = {
        type: 'l1-subscription',
        id: item.instrumentId,
        instrumentId: item.instrumentId,
        provider: item.provider,
        subscribe: false,
        kinds: ['last'],
      };
      this.websocketService.sendMessage(message);
    });
  }
}
