import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrDfService {
  private hubConnection!: HubConnection;

  connectSignalRDFHub(baseUrl: string) {
    if (baseUrl) {
      const dfHubUrl = baseUrl + '/api/master/dfHub';
      console.log('dfHubUrl: ', dfHubUrl);
      this.hubConnection = new HubConnectionBuilder().withUrl(dfHubUrl).build();
      this.connect();
      this.hubConnection?.onclose((error) => {
        console.log('SignalR connection closed.', error);
      });
    }
  }

  private async connect(): Promise<void> {
    try {
      await this.hubConnection?.start();
      console.log('DfSignalRHub connected');
    } catch (error) {
      console.error('DfSignalRHub connection error:', error);
    }
  }

  getHubConnection(): HubConnection {
    return this.hubConnection;
  }
}
