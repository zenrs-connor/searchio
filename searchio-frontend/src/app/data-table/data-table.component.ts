import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.sass']
})
export class DataTableComponent implements OnInit {

  @Input() data: any = {
    columns: [],
    rows: []
  }

  constructor() { }

  ngOnInit(): void {
  }

}
