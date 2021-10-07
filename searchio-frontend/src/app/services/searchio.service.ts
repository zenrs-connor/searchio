import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchioResponse } from '../models/SearchioResponse';
import { io as IO } from 'socket.io-client';
import { Md5 } from 'ts-md5';


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

  public addResult(result: any) {

    if(this.CONNECTIONS[result.query]) {

      let identifier;

      for(let datum of result.data) {
        identifier = Md5.hashStr(JSON.stringify(datum));

        if(!this.CONNECTIONS[result.query].resultsObject[identifier]) {
          this.CONNECTIONS[result.query].resultsObject[identifier] = { ...datum, sources: [] }
        }

        if(this.CONNECTIONS[result.query].resultsObject[identifier].sources.indexOf(result.source) < 0) {
          this.CONNECTIONS[result.query].resultsObject[identifier].sources.push(result.source);
          this.CONNECTIONS[result.query].resultsObject[identifier].sources.sort();
        }


        /*
        *
        *   Code preserved in case of changing back to a source/process object 
        * 
        */


        //  Check if a result with this identifier already exists in the results object
        //  If not, then initialise one
        /*if(!this.CONNECTIONS[result.query].resultsObject[identifier]) {
          this.CONNECTIONS[result.query].resultsObject[identifier] = { ...datum, sources: {} }
        }

        if(!this.CONNECTIONS[result.query].resultsObject[identifier].sources[result.source]) {
          this.CONNECTIONS[result.query].resultsObject[identifier].sources[result.source] = []
        }

        this.CONNECTIONS[result.query].resultsObject[identifier].sources[result.source].push(result.process);
        this.CONNECTIONS[result.query].resultsObject[identifier].sources.sort();*/
      }

      this.sortResults(result.query);

    }

  }

  public sortResults(query: string, field: string = "name", acscending: boolean = true) {

    if(!this.CONNECTIONS[query]) return;

    const sorted = [];
    const toSort = Object.keys(this.CONNECTIONS[query].resultsObject).map((x) => { return this.CONNECTIONS[query].resultsObject[x] });

    console.log(toSort);

    let result: any, compare: any;

    for(let i = 0 ; i < toSort.length ; i++) {

      result = toSort[i];

      if(sorted.length === 0) {
        sorted.push(result);
      } else {

        for(let j = 0 ; j < sorted.length ; j++) {

          compare = sorted[j];

          console.log(result);

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

    const socket = IO("http://localhost:5000", { transports: ["websocket"]});

        socket.on("connect", () => {
          console.log(`Client connection! Joining room ${ socketID }`);

          socket.emit('join', socketID);

          if(!this.CONNECTIONS[query]) {
            this.CONNECTIONS[query] = {
              socket: socket,
              sources: {},
              resultsObject: {},
              resultsArray: []
            }
          }

          socket.on('send', (message) => { console.log(message)})

          /* EVENT HANDLING */

          socket.on('process-update', (process) => {
            console.log("Got Process Update!", process);

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
            console.log("Got Process Result!", result);
            this.addResult(result);

          });

        });


          

          

        socket.on("connect_error", () => {
          console.log("Could not connect!");
        })


  }

}