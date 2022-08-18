import { Injectable, OnInit } from '@angular/core';
import { QueryView } from '../types/QueryView';
import { SearchioService } from './searchio.service';

@Injectable({
  providedIn: 'root'
})
export class PageManagerService {

  private queryTabs: string[] = [];
  private activeTab: string = "";

  private resultArrays: any = {}

  private view: QueryView = "Process"

  private QUERIES: any = {};

  private hiddenResults: any = {};
  private filterTerm: string = '';

  constructor(private searchio: SearchioService) {
    this.fetchLoop();
  }


  private fetchLoop() {

    let connection;

    const interval = setInterval(() => {

      for(let query in this.QUERIES) {
        connection = this.searchio.getConnection(query);

        if(connection && connection.resultHash !== this.QUERIES[query].hash) {
          this.fetchResults(this.view, query);
        }

      }

    }, 1000);
  }


  /* Query Status Functions */

  public getQueryStatus(query: string = this.activeTab) {

    const connection = this.searchio.getConnection(query);

    if(connection) {
      return connection.status;
    }

    return undefined;
  }

  /* OVERALL FILTER FUNCTIONS */

  public clearFilters() {
    this.clearDataSourceFilters();
    this.clearDataTypeFilters();
  }

  public setFilterTerm(term: string) {
    this.filterTerm = term.toLowerCase();
  }

  public getFilterTerm(): string {
    return this.filterTerm;
  }

  /* DATA SOURCE FILTER FUNCTIONS */

  public clearDataSourceFilters(query: string = this.activeTab) {
    for(let source in this.QUERIES[query].hiddenDataSources) {
      delete this.QUERIES[query].hiddenDataSources[source];
    }
  }

  public hideDataSource(source: string, query: string = this.activeTab) {
    this.QUERIES[query].hiddenDataSources[source] = true;
  }

  public showDataSource(source: string, query: string = this.activeTab) {
    if(this.QUERIES[query].hiddenDataSources[source]) {
      delete this.QUERIES[query].hiddenDataSources[source];
    }
  }

  public toggleShowDataSource(source: string, query: string = this.activeTab) {
    if(this.isHiddenDataSource(source, query)) {
      this.showDataSource(source, query);
    } else {
      this.hideDataSource(source, query);
    }
  }

  public isHiddenDataSource(source: string, query: string = this.activeTab) {
    if(this.QUERIES[query].hiddenDataSources[source]) return true;
    return false;
  }


  /* DATA TYPE FILTER FUNCTIONS */

  public clearDataTypeFilters(query: string = this.activeTab) {
    for(let type in this.QUERIES[query].hiddenDataTypes) {
      delete this.QUERIES[query].hiddenDataTypes[type];
    }
  }

  public hideDataType(type: string, query: string = this.activeTab) {
    this.QUERIES[query].hiddenDataTypes[type] = true;
  }

  public showDataType(type: string, query: string = this.activeTab) {
    if(this.QUERIES[query].hiddenDataTypes[type]) {
      delete this.QUERIES[query].hiddenDataTypes[type];
    }
  }

  public toggleShowDataType(type: string, query: string = this.activeTab) {
    if(this.isHiddenDataType(type, query)) {
      this.showDataType(type, query);
    } else {
      this.hideDataType(type, query);
    }
  }

  public isHiddenDataType(type: string, query: string = this.activeTab) {
    if(this.QUERIES[query].hiddenDataTypes[type]) return true;
    return false;
  }


  public hideResults() {

    let results = this.getResults();
    for(let result of results) {
      this.hideResult(result.identifier);
    }
  }

  public showResults() {

    let results = this.getResults();

    for(let result of results) {
      this.showResult(result.identifier);
    }


  }


  public hideResult(id: string) {
    this.hiddenResults[id] = true;
  }

  public showResult(id: string) {
    if(this.hiddenResults[id]) {
      delete this.hiddenResults[id];
    }
  }

  public resultIsHidden(id: string): boolean {
    if(this.hiddenResults[id]) return true;
    return false;
  }

  public setView(view: QueryView) {
    this.view = view;
  }

  public getView(): QueryView {
    return this.view;
  }

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
        sort_ascending: false,
        hash: "",
        hiddenResults: {},
        hiddenDataSources: {},
        hiddenDataTypes: {}
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

    let index = this.queryTabs.indexOf(query)

    if(index < 0) return;

    this.queryTabs.splice(index, 1);

    if(!this.queryTabs[index]) {
      index--;
    }


    if(this.queryTabs[index]) {
      this.activeTab = this.queryTabs[index];
    } else {
      this.activeTab = "";
    }

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

  public getSources(query: string = this.activeTab) {

    const obj: any = {};
    const connection = this.searchio.getConnection(query);

    let result, source;

    if(connection) {

      for(let id in connection.results) {
    
        result = connection.results[id];
        source = result.source;
        if(!obj[source]) {
          obj[source] = []
        }
        obj[source].push(result.id);
      }

      const keys = Object.keys(obj);
      keys.sort();

      return keys.map((x) => { return { source: x, ids: obj[x] } })

    }
    return [];

  }

  public getDataTypes(query: string = this.activeTab) {

    const obj: any = {};
    const connection = this.searchio.getConnection(query);

    let result, source;

    if(connection) {

      for(let id in connection.results) {
    
        result = connection.results[id];
        
        for(let data of result.data) {

          if(!obj[data.type]) {
            obj[data.type] = []
          }

          obj[data.type].push(result.id);

        }

      }

      
      const keys = Object.keys(obj);
      keys.sort();

      return keys.map((x) => { return { type: x, ids: obj[x] } })


    }
    return [];

  }


  public fetchResults(view: QueryView = this.view, query: string = this.activeTab) {

    console.log("fetching");

    const connection = this.searchio.getConnection(query);

    let arr = [];

    if(connection) {

      if(view === 'Process') {

        for(let key in connection.results) {
          arr.push({ ...connection.results[key], identifier: key });
        }

      }

      this.QUERIES[query].hash = connection.resultHash;
      this.resultArrays[query] = arr;
    }



  }

  public getResults(query: string = this.activeTab) {

    if(this.resultArrays[query]) {
      return this.resultArrays[query];
    }

    return [];
  }

}
