import { Injectable } from '@angular/core';
import { SearchioService } from './searchio.service';

@Injectable({
  providedIn: 'root'
})
export class PageManagerService {

  private queryTabs: string[] = [];
  private activeTab: string = "";

  private QUERIES: any = {};

  constructor(private searchio: SearchioService) { }

  public getQueryTabs(): string[] {
    return this.queryTabs;
  }

  public getActiveQuery(): string {
    return this.activeTab;
  }

  public selectTab(query: string) {

    if(query === this.activeTab) return;

    let index = this.queryTabs.indexOf(query);

    if(index < 0) {
      this.queryTabs.splice(0, 0, query);
    }

    this.activeTab = query;

  }

  public sortResults(field: string = "name", asc: boolean = false, query: string = this.activeTab) {

    if(this.QUERIES[query]) {
      this.QUERIES[query].sort_field = field;
      this.QUERIES[query].sort_ascending = asc;
    }

    this.searchio.sortResults(query, field, asc);

  }

  public getQueryData(query: string = this.activeTab) {
    return this.QUERIES[query];
  }

  public async addTab(query: string) {

    const index = this.queryTabs.indexOf(query);

    if(!this.QUERIES[query]) {
      this.QUERIES[query] = {
        sort_field: "name",
        sort_ascending: false
      }
    }

    if(index >= 0) {
      
      this.queryTabs.splice(index, 1);
    }

    this.queryTabs.splice(0, 0, query);


    this.selectTab(query);

    let res = await this.searchio.addQuery(query);

  }

  public closeTab(query: string) {

    const index = this.queryTabs.indexOf(query)

    if(index < 0) return;

    this.queryTabs.splice(index, 1);

  }

  public getProgress(query: string = this.activeTab) {

    let connection = this.searchio.getConnection(query);

    if(!connection) return undefined;

    const progress: any = {
      DORMANT: [],      
      ACTIVE: [],      
      COMPLETED: [],      
      ERROR: []      
    }

    let source, process;

    for(let s in connection.sources) {

      source = connection.sources[s];

      for(let p in source.processes) {

        process = source.processes[p];

        progress[process.status].push({ ...process });

      }
    }


    return progress;

  }

  public getResults(query: string = this.activeTab) {

    const connection = this.searchio.getConnection(query);

    if(connection) {
      return connection.resultsArray;
    }

    return [];
  }

}
