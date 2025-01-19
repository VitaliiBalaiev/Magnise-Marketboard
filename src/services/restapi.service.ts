import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { Candlestick } from '../models/candlestick.model';
import { Asset } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class RestapiService {
  constructor(private http: HttpClient) {}

  async getAccessToken(): Promise<string> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', environment.client_id)
      .set('username', environment.username)
      .set('password', environment.password);

    try {
      const response = await firstValueFrom(
        this.http.post<{ access_token: string }>(environment.tokenEndpoint, body)
      );
      const accessToken = response.access_token;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }

  async fetchProviders(): Promise<string[]> {
    const response: any = await firstValueFrom(
      this.http.get<{ data: string[] }>('/api/instruments/v1/providers')
    );
    return response.data;
  }

  async fetchAssetInstruments(): Promise<Asset[]> {
    try {
      const providersResponse: any = await firstValueFrom(
        this.http.get<{ data: string[] }>('/api/instruments/v1/providers')
      );
      const providers = providersResponse.data;

      const assets: Asset[] = [];
      for (const provider of providers) {
        const instrumentsResponse: any = await firstValueFrom(
          this.http.get<{ data: { id: string; symbol: string }[] }>(
            `/api/instruments/v1/instruments?provider=${provider}`
          )
        );
        const providerAssets = instrumentsResponse.data.map((item: { id: string; symbol: string }) => ({
          instrument: {
            id: item.id,
            symbol: item.symbol,
          },
          provider,
          timestamp: '',
          price: 0,
          volume: 0,
          change: 0,
          changePct: 0,
        }));
        assets.push(...providerAssets);
      }
      return assets;
    } catch (error) {
      console.error('Error fetching asset instruments:', error);
      return [];
    }
  }

  async fetchCandlestickData(instrument: string, provider: string, interval: number, periodicity: string): Promise<Candlestick[]> {
    const response = await firstValueFrom(
      this.http.get<{ data: Candlestick[] }>(
        `/api/bars/v1/bars/count-back?instrumentId=${instrument}&provider=${provider}&interval=${interval}&periodicity=${periodicity}&barsCount=500`
      )
    );
    return response.data;
  }
}
