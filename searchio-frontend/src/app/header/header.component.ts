import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'searchio-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent extends ServiceInjectedComponent {

  @ViewChild('search', {static: true}) private searchRef: ElementRef | undefined;

  constructor(injector: Injector) { super(injector) }

  public onKeyPress(e: KeyboardEvent) {
    if(e.key === 'Enter') {
      this.startSearch();
    }
  }

  public startSearch() {

    const q = this.searchRef?.nativeElement.value;

    if(q) {
      this._manager.addTab(q);
      if(this.searchRef) {
        this.searchRef.nativeElement.value = '';
      }
    }
    
  }

  public foo() {
    console.log('bar')
  }

}
