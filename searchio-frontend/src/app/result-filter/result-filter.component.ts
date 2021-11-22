import { Component, Injector, Input, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'result-filter',
  templateUrl: './result-filter.component.html',
  styleUrls: ['./result-filter.component.sass']
})
export class ResultFilterComponent extends ServiceInjectedComponent implements OnInit {

  @Input() name: string = 'undefined';
  @Input() count: number = 0;
  @Input() icon: string = '';
  @Input() hidden: boolean = false;

  constructor(injector: Injector) { super(injector); }

  ngOnInit() {
  }

}
