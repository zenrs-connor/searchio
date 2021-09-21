import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageManagerService {

  private queryTabs: string[] = [
    "query a", "query b", "query c",
    "query d", "query e", "query f",
    "query g", "query h", "query i",
    "query j", "query k", "query l",
    "query m", "query n", "query o",
    "query p", "query q", "query r",
    "query s", "query t", "query u",
    "query v", "query w", "query x",
    "query y", "query z"
  ];
  private activeTab: string = "query a";

  constructor() { }

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

  public addTab(query: string) {

    const index = this.queryTabs.indexOf(query);

    if(index >= 0) {
      
      this.queryTabs.splice(index, 1);
    }

    this.queryTabs.splice(0, 0, query);

    this.selectTab(query);

  }

  public closeTab(query: string) {

    const index = this.queryTabs.indexOf(query)

    if(index < 0) return;

    this.queryTabs.splice(index, 1);

  }

}
