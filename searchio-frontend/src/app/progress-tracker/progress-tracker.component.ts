import { Component, Injector, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.sass']
})
export class ProgressTrackerComponent extends ServiceInjectedComponent {

  public open: boolean = false;

  constructor(injector: Injector) { super(injector); }

  public percentage(): number {

    const progress = this._manager.getProgress();

    if(!progress) return NaN;

    return Math.round((progress.COMPLETED.length + progress.ERROR.length) / (progress.ACTIVE.length + progress.COMPLETED.length + progress.ERROR.length) * 100);

  }
  

}