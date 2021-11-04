import { Component, Injector, Input, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.sass']
})
export class QueryResultComponent extends ServiceInjectedComponent {

  @Input() result: any = undefined;

  constructor(injector: Injector) { super(injector); }

}
