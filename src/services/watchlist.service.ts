import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {WatchlistItem} from '../models/watchlist-item.model';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchlist = new BehaviorSubject<WatchlistItem[]>([]);
  watchlist$ = this.watchlist.asObservable();

  addToWatchlist(item: WatchlistItem): void {
    const currentList = this.watchlist.value;
    if (!currentList.some(w => w.instrumentId === item.instrumentId && w.provider === item.provider)) {
      this.watchlist.next([...currentList, item]);
    }
  }

  removeFromWatchlist(item: WatchlistItem): void {
    const updatedList = this.watchlist.value.filter(
      w => !(w.instrumentId === item.instrumentId && w.provider === item.provider)
    );
    this.watchlist.next(updatedList);
  }
}
