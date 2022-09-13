import { style } from '@angular/animations';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { AfterContentInit, AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

import * as ApexCharts from 'apexcharts';

@Component({
  selector: 'data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.sass']
})
export class DataTableComponent implements OnInit, AfterContentInit {

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.flexWidth = this.getFlexWidth();
  }


  @ViewChild('container', {static: false}) containerRef: ElementRef | undefined;  


  @Input() title: string = "Table";

  @Input() data: any = {
    columns: [],
    rows: [],
  }

  public view: 'TABLE' | 'GRAPH' = 'TABLE';

  public expanded: boolean = true;
  public LIMIT_INCREMENT: number = 5;
  public limit: number = 3;
  public sortField: string = '';
  public sortAsc: boolean = false;

  public containerID = this.generateUID();
  public chartIDs: any = {};

  private canvas: HTMLCanvasElement | undefined;
  private ctx: any;
  private chart: any;

  public flexWidth: string = '1000px';
  public widthChecked: boolean = false;

  constructor() { }

  ngOnInit(): void {
    if(this.data.columns.length > 0) {
      this.sortColumn(this.data.columns[0].key);
    }

    console.log(this.data);
  }

  private generateUID(): string {
    return String(Math.round(Math.random() * 0xFFFFFFFFFFF));
  }

  async ngAfterContentInit() {
    setTimeout(() => {
      this.flexWidth = this.getFlexWidth();
      this.widthChecked = true;
    }, 0)
    
  }

  public setView(view: 'TABLE' | 'GRAPH') {
    this.view = view;

    console.log(this.data);

    if(view === "GRAPH") {
      setTimeout(() => {
        this.initGraphs();
      }, 1)

    }
  }

  private initGraphs() {

    const container = <HTMLDivElement> document.getElementById(this.containerID);
    container.innerHTML = "";


    let uid;

    for(let graph of this.data.graphs) {

      uid = this.generateUID();
      let elem = <HTMLDivElement> document.createElement('div');
      elem.id = uid;
      elem.className = "chart-element";


      //  Styles
      elem.style.flex = "1";
      elem.style.height = '300px';

      this.chartIDs[graph.type] = uid;
      container.appendChild(elem);
  
      let data = [], labels = [];

      let opts;

      switch(graph.type) {
        case "bar":

          for(let d of this.data.rows) {
            data.push(parseInt(d[graph.series[0].dataKey]));
            labels.push(d[graph.series[0].labelsKey]);
          } 

          opts = {
            chart: {
              height: 300,
              width: "100%",
              type: "bar"
            },
            series: [{ name: '#', data: data }],
            plotOptions: {
              bar: {
                horizontal: true,
                borderRadius: 5
              }
            },
            xaxis: {
              categories: labels
            }
          }



          break;
        case "pie":


          for(let d of this.data.rows) {
            data.push(parseInt(d[graph.series[0].dataKey]));
            labels.push(d[graph.series[0].labelsKey]);
          } 

          opts = {
            chart: {
              type: "pie",
              height: '100%',
              width: "100%"
            },
            series: data,
            labels: labels
          }

          break;
        default:
          break;
      }


      const chart = new ApexCharts(elem, opts);
      chart.render();

      


    }


    
    
  }

  public getFlexWidth(): string {

    if(!this.containerRef) return '0px';
    

    let fullWidth = this.containerRef.nativeElement.clientWidth

    console.log(fullWidth)

    let setCount = 0;

    for(let c of this.data.columns) {

      if(c.width) {
        setCount++;
        fullWidth -= c.width.replace(/[a-zA-Z]/g, '')
      }

    }

    return fullWidth / (this.data.columns.length - setCount) + 'px !important';

  }


  public getColumnWidth(column: string): string {
   
    let col;
    for(let c of this.data.columns) {
      if(c.key === column) {
        col = c;
        break;
      }
    }

    if(col) {

      if(col.width) return col.width;
      else {
        return this.getFlexWidth();
      }


    } else {
      return '0px'
    }
    
  }

  public sortColumn(column: string) {

    if(this.sortField !== column) {
      this.sortField = column;

      switch(this.getColumnType(column)) {

        case 'Text':
          this.sortAsc = true;
          break;
        case 'Number':
          this.sortAsc = true;
          break;
        default:
          this.sortAsc = false;

      }
  

    } else {
      this.sortAsc = !this.sortAsc;
    }

    this.sort();

  }

  public isColumn(key: string): boolean {
    for(let c of this.data.columns) {
      if(c.key === key) return true;
    } 
    return false;
  }

  public getColumnType(key: string): string | undefined {

    for(let c of this.data.columns) {
      if(c.key === key) return c.type;
    } 

    return undefined;
  }

  public sort(column: string = this.sortField, asc: boolean = this.sortAsc) {

    //  Check that the column is valid
    if(!this.isColumn(column)) return;

    let type = this.getColumnType(column);

    let rows = [];
    let val, comp;

    for(let row of this.data.rows) {

      if(rows.length === 0) {
        rows.push(row);
      } else {


        switch(type) {

          case "WebLink":
            val = row[column].text.toLowerCase();
            break;

          case "Number":
            val = parseFloat(row[column]);
            break;
          
          case "Date":
            val = row[column] ? new Date(row[column]) : new Date(0);
            break;

          default:
            val = row[column].toLowerCase();
            break;

        }





        for(let i = 0 ; i < rows.length ; i++) {

          switch(type) {

            case "WebLink":
              comp = rows[i][column].text.toLowerCase();
              break;
            
            case "Date":
              comp = rows[i][column] ? new Date(rows[i][column]) : new Date(0);
              break;

            case "Number":
              comp = parseFloat(rows[i][column])
              break;
  
            default:
              comp = rows[i][column].toLowerCase();
              break;
  
          }


          if(val < comp) {
            rows.splice(i, 0, row);
            break;
          }

          if(i === rows.length - 1) {
            rows.push(row);
            break;
          }

        }

      }

    }

    if(!asc) rows.reverse();

    this.data.rows = rows;

  }

}
