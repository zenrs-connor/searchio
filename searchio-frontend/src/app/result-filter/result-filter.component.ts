import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'result-filter',
  templateUrl: './result-filter.component.html',
  styleUrls: ['./result-filter.component.sass']
})
export class ResultFilterComponent implements OnInit {

  @Input() type: string = 'undefined';

  constructor() { }

  ngOnInit(): void {
  }

}
