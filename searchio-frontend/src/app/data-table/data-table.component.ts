import { AfterContentInit, AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

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

  public expanded: boolean = true;
  public LIMIT_INCREMENT: number = 5;
  public limit: number = 3;
  public sortField: string = '';
  public sortAsc: boolean = false;

  public flexWidth: string = '1000px';
  public widthChecked: boolean = false;

  constructor() { }

  ngOnInit(): void {

    if(this.data.columns.length > 0) {

      this.sortColumn(this.data.columns[0].key);


    }
  }

  async ngAfterContentInit() {
    setTimeout(() => {
      this.flexWidth = this.getFlexWidth();
      this.widthChecked = true;
    }, 0)
    
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
