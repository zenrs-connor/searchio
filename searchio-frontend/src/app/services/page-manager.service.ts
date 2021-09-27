import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageManagerService {

  private queryTabs: string[] = [
    "abcdefghijklmnopqrstuvwxyz", "abcdefg hijk lmnop qrs tuv wxyz", "query c"
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
