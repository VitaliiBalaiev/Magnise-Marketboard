import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../environments/environment.development';
import {firstValueFrom} from 'rxjs';
import {InstrumentStoreService} from './instrument-store.service';

@Injectable({
  providedIn: 'root'
})
export class RestapiService {
  constructor(private http: HttpClient, private instrumentStore: InstrumentStoreService) {}

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
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('Authorization token is missing.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const response: any = await firstValueFrom(
      this.http.get<{ data: string[] }>('/api/instruments/v1/providers', { headers })
    );

    return response.data;
  }

  async fetchInstruments(provider: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Authorization token is missing.');
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await firstValueFrom(
        this.http.get<{ data: any[] }>(`/api/instruments/v1/instruments?provider=${provider}`, { headers })
      );

      const instruments = response.data.map((instrument: { id: string; symbol: string; }) => ({
        id: instrument.id,
        symbol: instrument.symbol,
      }));

      this.instrumentStore.setInstruments(instruments);
    } catch (error) {
      console.error('Error fetching instruments:', error);
    }
  }


}
