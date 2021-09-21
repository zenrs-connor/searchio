import { Component, Injector, OnInit } from '@angular/core';
import { PageManagerService } from '../services/page-manager.service';

@Component({
  selector: 'app-service-injected',
  templateUrl: './service-injected.component.html',
  styleUrls: ['./service-injected.component.sass']
})
export class ServiceInjectedComponent {

  public _manager: PageManagerService;

  constructor(injector: Injector) {
    this._manager = injector.get(PageManagerService);
  }

}
