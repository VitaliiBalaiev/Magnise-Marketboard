import {Instrument} from './instrument.model';

export interface Asset {
  instrument: Instrument;
  provider: string;
  timestamp: string;
  price: number;
  volume: number;
  change: number;
  changePct: number;

}
