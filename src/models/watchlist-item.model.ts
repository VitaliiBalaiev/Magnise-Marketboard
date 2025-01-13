export interface WatchlistItem {
  provider: string;
  instrumentId: string;
  symbol: string;
  price?: number;
  change?: number;
  changePct?: number;
  timestamp?: string;
}
