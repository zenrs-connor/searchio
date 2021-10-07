import { Component, Injector, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'searchio-results',
  templateUrl: './searchio-results.component.html',
  styleUrls: ['./searchio-results.component.sass']
})
export class SearchioResultsComponent extends ServiceInjectedComponent {

  constructor(injector: Injector) { super(injector); }


}
