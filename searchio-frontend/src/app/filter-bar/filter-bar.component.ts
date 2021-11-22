import { Component, Injector, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.sass']
})
export class FilterBarComponent extends ServiceInjectedComponent {

  constructor(injector: Injector) { super(injector) }

}
