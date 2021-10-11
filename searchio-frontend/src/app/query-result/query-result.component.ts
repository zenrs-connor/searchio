import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.sass']
})
export class QueryResultComponent {

  @Input() result: any = undefined;

  constructor() { }

}
