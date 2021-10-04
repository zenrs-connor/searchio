import { Injectable } from '@angular/core';
import { SearchioService } from './searchio.service';

@Injectable({
  providedIn: 'root'
})
export class PageManagerService {

  private queryTabs: string[] = [];
  private activeTab: string = "";

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

  public async addTab(query: string) {

    const index = this.queryTabs.indexOf(query);

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
      1: [],      //  DORMANT
      2: [],      //  ACTIVE
      3: [],      //  COMPLETED
      4: []       //  ERROR
    }

    let source, process;

    for(let s in connection.statuses) {
      source = connection.statuses[s];
      for(let p in source) {

        process = source[p];

        progress[process.code].push({ source: s, process: p, message: process.message });

      }
    }


    return progress;

  }

}
