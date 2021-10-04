import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchioResponse } from '../models/SearchioResponse';
import { io as IO } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SearchioService {

  private CONNECTIONS: any = {};

  private headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  });
  private api = `http://localhost:5000/api`;

  constructor(private http: HttpClient) { }

  public async addQuery(query: string) {

    return await new Promise((resolve) => {
      this.http.get<SearchioResponse>(`${this.api}/query/add/${query}`, { headers: this.headers }).subscribe((res: SearchioResponse) => {

        if(res.success) {
          this.initConnection(query, res.data.socket);
        }

        resolve(res);
      })
    });
    
  }

  public getQuery(query: string) {

  }

  public killQuery(query: string) {

  }


  public getConnection(query: string) {
    return this.CONNECTIONS[query];
  }

  private initConnection(query: string, socketID: string) {

    const socket = IO("http://localhost:5000", { transports: ["websocket"]});

        socket.on("connect", () => {
          console.log(`Client connection! Joining room ${ socketID }`);

          socket.emit('join', socketID);



          if(!this.CONNECTIONS[query]) {
            this.CONNECTIONS[query] = {
              socket: socket,
              statuses: {}
            }
          }

          socket.on('send', (message) => { console.log(message)})

          /* EVENT HANDLING */

          socket.on('status-update', (update) => {
            console.log("Got Status Update!", update);

            console.log(this.CONNECTIONS);

            if(this.CONNECTIONS[update.query]) {
              this.CONNECTIONS[update.query].statuses[update.source] = update.statuses;
            }



          });

        });

          

          

        socket.on("connect_error", () => {
          console.log("Could not connect!");
        })


  }

}