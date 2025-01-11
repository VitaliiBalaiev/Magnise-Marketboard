import { Injectable } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Subject, Subscription} from 'rxjs';
import {environment} from '../environments/environment.development';
import {RestapiService} from './restapi.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private accessToken: string | null = null;
  private websocket: WebSocketSubject<any> | null = null;
  private websocketSubscription: Subscription | null = null;
  private baseWssUri = environment.baseWssUri;
  public messageSubject: Subject<any> = new Subject<any>();

  constructor(private restApiService: RestapiService) {}

  async initialize(): Promise<void> {
    try {
      this.accessToken = await this.restApiService.getAccessToken();
      if (this.accessToken) {
        this.connectToWebSocket();
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  public ngOnDestroy(): void {
    this.closeWebSocket();
  }

  private connectToWebSocket(): void {
    const websocketUrl = `${this.baseWssUri}/api/streaming/ws/v1/realtime?token=${this.accessToken}`;
    this.websocket = webSocket(websocketUrl);

    this.websocketSubscription = this.websocket.subscribe({
      next: (message) => this.handleWebSocketMessage(message),
      error: (error) => console.error('WebSocket error:', error),
      complete: () => console.log('WebSocket connection closed')
    });
  }

  private closeWebSocket(): void {
    this.websocketSubscription?.unsubscribe();
    this.websocket?.complete();
    this.websocket = null;
    console.log("WebSocket connection closed.");
  }

  public sendMessage(message: any): void {
    if (this.websocket) {
      this.websocket.next(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  private handleWebSocketMessage(message: any): void {
    this.messageSubject.next(message);
  }

  public getMessage() {
    return this.messageSubject.asObservable();
  }
}
