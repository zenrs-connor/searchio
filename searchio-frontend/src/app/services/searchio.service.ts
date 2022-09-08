import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchioResponse } from '../models/SearchioResponse';
import { io as IO } from "socket.io-client";
import * as MD5 from "md5"


@Injectable({
  providedIn: 'root'
})
export class SearchioService {

  private CONNECTIONS: any = {};

  private headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  });
  private api = `http://88.97.13.136:3002/api`;

  constructor(private http: HttpClient) { }

  public async addQuery(query: string) {

    return await new Promise((resolve) => {
      this.http.get<SearchioResponse>(`${this.api}/query/add/${ encodeURIComponent(query) }`, { headers: this.headers }).subscribe((res: SearchioResponse) => {

        if(res.success) {

          this.initConnection(query, res.data.socket);

          setTimeout(() => {

            console.log(res);

            if(res.data.results) {
              for(let r of res.data.results) {
                this.addResult(r);
              }
            }

            if(res.data.status) {
              if(this.CONNECTIONS[query]) {
                this.CONNECTIONS[query].status = res.data.status;
              }
            }


          }, 1000)
          
        }

        resolve(res);
      })
    });
    
  }

  private async waitForConnection(query: string) {

  }

  public getQuery(query: string) {

  }

  public killQuery(query: string) {

  }


  public getConnection(query: string) {
    return this.CONNECTIONS[query];
  }

  public addResult(result: any) {

    console.log(result);

    if(this.CONNECTIONS[result.query]) {
      const identifier = `${result.source}:${result.process_id}`;

      this.CONNECTIONS[result.query].results[identifier] = result;
      this.CONNECTIONS[result.query].resultHash = MD5(JSON.stringify(this.CONNECTIONS[result.query].results));
    }
  }

  public sortResults(query: string, field: string = "name", acscending: boolean = true) {

    if(!this.CONNECTIONS[query]) return;

    const sorted = [];
    const toSort = Object.keys(this.CONNECTIONS[query].resultsObject).map((x) => { return this.CONNECTIONS[query].resultsObject[x] });

    let result: any, compare: any;

    for(let i = 0 ; i < toSort.length ; i++) {

      result = toSort[i];

      if(sorted.length === 0) {
        sorted.push(result);
      } else {

        for(let j = 0 ; j < sorted.length ; j++) {

          compare = sorted[j];

          if(JSON.stringify(result[field]) < JSON.stringify(compare[field])) {
            sorted.splice(j, 0, result);
            break;
          }

          if(j === sorted.length - 1) {
            sorted.push(result);
            break;

          }
        }

      }

    }

    this.CONNECTIONS[query].resultsArray = sorted;

  }

  private initConnection(query: string, socketID: string) {

    const socket = IO("http://88.97.13.136:3002", { transports: ["websocket"]});

        socket.on("connect", () => {

          console.log(`Client connection! Joining room ${ socketID }`);

          socket.emit('join', socketID);

          if(!this.CONNECTIONS[query]) {
            this.CONNECTIONS[query] = {
              socket: socket,
              results: {},
              resultsHash: "",
              sources: {},
              status: {}
            }
          }


          socket.on('send', (message) => { console.log(message)})

          /* EVENT HANDLING */

          socket.on('process-update', (process) => {

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

          //  Event fired when a Stream emits a new result
          socket.on('process-result', (result) => {
            this.addResult(result);

          });


          socket.on('query-update', (status) => {

            //  Check that the query made by this process has a valid connection
            if(this.CONNECTIONS[status.query]) {
              this.CONNECTIONS[status.query].status = status;
            }

          });

        });


        

        socket.on("connect_error", () => {
          console.log("Could not connect!");
        })


  }

}