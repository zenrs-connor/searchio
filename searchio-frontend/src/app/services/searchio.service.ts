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
              sources: {}
            }
          }

          socket.on('send', (message) => { console.log(message)})

          /* EVENT HANDLING */

          socket.on('process-update', (process) => {
            console.log("Got Process Update!", process);

            console.log(this.CONNECTIONS);

            //  Check that the query made by this process has a valid connection
            if(this.CONNECTIONS[process.query]) {

              //  Check if there is there is ann existing DataSource key in the connection object
              //  If not, initialise a new one
              if(!this.CONNECTIONS[process.query].sources[process.source]) {

                this.CONNECTIONS[process.query].sources[process.source] = {
                  processes: {}   //  Object to hold processes for this data source
                }

              }

              this.CONNECTIONS[process.query].sources[process.source].processes[process.name] = process;
            }

          });

        });

          

          

        socket.on("connect_error", () => {
          console.log("Could not connect!");
        })


  }

}