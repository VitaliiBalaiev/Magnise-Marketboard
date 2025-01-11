import { Injectable } from '@angular/core';
import {Instrument} from '../models/instrument.model';

@Injectable({
  providedIn: 'root'
})
export class InstrumentStoreService {
  private instruments: Instrument[] = [];

  public setInstruments(instruments: Instrument[]): void {
    this.instruments = instruments;
  }

  public getInstruments(): Instrument[] {
    return this.instruments;
  }
}
