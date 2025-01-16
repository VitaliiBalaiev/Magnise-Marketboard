export interface WatchlistItem {
  instrumentId: string;
  provider: string;
  symbol: string;
  price: number;
  volume: number;
  askPrice?: number;
  askVolume?: number;
  bidPrice?: number;
  bidVolume?: number;
  change?: number;
  changePct?: number;
}
