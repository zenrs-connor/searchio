import { Component, Injector, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.sass']
})
export class ProgressTrackerComponent extends ServiceInjectedComponent {

  constructor(injector: Injector) { super(injector); }

  

}