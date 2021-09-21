import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { ServiceInjectedComponent } from '../service-injected/service-injected.component';

@Component({
  selector: 'searchio-nav',
  templateUrl: './searchio-nav.component.html',
  styleUrls: ['./searchio-nav.component.sass']
})
export class SearchioNavComponent extends ServiceInjectedComponent {

  @ViewChild('scroller', {static: true}) private scrollerRef: ElementRef | undefined;

  public scrollInterval: any;
  public scrollTarget: number = 0;

  public queries: string[] = ["query 1", "query 2", "query 3"];

  constructor(injector: Injector) { super(injector); }

  public onButtonClick(e: MouseEvent, query: string) {
    if((e as any).target.className === 'close') {
      this._manager.closeTab(query);
    } else {
      this._manager.selectTab(query);
    }
  }

  public scrolledRight(): boolean {
    return this.scrollerRef?.nativeElement.scrollLeft > 0;
  }

  public scrolledLeft(): boolean {
    return this.scrollerRef?.nativeElement.scrollLeft < this.scrollerRef?.nativeElement.scrollWidth - this.scrollerRef?.nativeElement.clientWidth;
  }

  public scroll(px: number, ms: number = 250) {

    if(this.scrollerRef) {

      if(!this.scrollInterval) {

        const start = this.scrollerRef.nativeElement.scrollLeft;

        let rate = px / (ms/10);

        let to = 0;

        this.scrollInterval = setInterval(() => {

          to++;

          if(this.scrollerRef) {

            this.scrollerRef.nativeElement.scrollLeft += rate;


            if(px >= 0) {
              if(this.scrollerRef.nativeElement.scrollLeft >= start + px) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = undefined;
              }
            } else if (px === 0) {
              clearInterval(this.scrollInterval);
              this.scrollInterval = undefined;
            } else {
              if(this.scrollerRef.nativeElement.scrollLeft <= start + px) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = undefined;
              }
            }
          
          } else {
            clearInterval(this.scrollInterval);
            this.scrollInterval = undefined;
          }

          if(to >= ms / 10) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = undefined;
          }

        }, 10);

      }
    }

  }
}
