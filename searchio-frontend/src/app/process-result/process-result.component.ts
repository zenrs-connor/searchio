import { Component, Injector, Input, OnInit } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'process-result',
  templateUrl: './process-result.component.html',
  styleUrls: ['./process-result.component.sass']
})
export class ProcessResultComponent extends ServiceInjectedComponent {

  @Input() result: any;

  constructor(injector: Injector) { super(injector); }

  public toggleHidden() {

    const isHidden = this._manager.resultIsHidden(this.result.identifier);

    if(isHidden) {
      this._manager.showResult(this.result.identifier);
    } else {
      this._manager.hideResult(this.result.identifier);
    }

  }

  public hidden(): boolean {

    if(this._manager.isHiddenDataSource(this.result.source)) return true;

    for(let d of this.result.data) {

      if(!this._manager.isHiddenDataType(d.type)) {
        return false;
      }

    }


    return true;

  }

}
