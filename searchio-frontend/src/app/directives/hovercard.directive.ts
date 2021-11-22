import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[hovercard]'
})
export class HovercardDirective implements AfterViewInit, OnChanges {

  @Input() message: string = 'Message';

  @Input() position: HovercardPosition = 'right';

  protected element: any;
  protected hovercard: any;



  constructor(el: ElementRef) {
    this.element = el.nativeElement;
    this.element.className += ' hovercard-container';
  }

  ngAfterViewInit() {

    this.hovercard = document.createElement('div');
    this.hovercard.innerHTML = this.message;
    this.hovercard.className = 'hovercard';

    this.setHovercardPosition();

    this.element.appendChild(this.hovercard);
  }

  ngOnChanges(change: SimpleChanges) {
    if(this.hovercard && change.hasOwnProperty('message')) {
      this.hovercard.innerHTML = this.message;
      this.setHovercardPosition();
    }
  }

  protected setHovercardPosition() {

    console.log(this.position)

    switch(this.position) {

      case 'right':

        this.hovercard.style.marginLeft = this.element.clientWidth + 'px';
        this.hovercard.style.marginTop = (0 - this.element.clientHeight) + 'px';

        break;

      case 'left':

        this.hovercard.style.marginTop = (0 - this.element.clientHeight) + 'px';
        this.hovercard.style.right = (window.innerWidth - this.element.offsetLeft) + 'px';

        break;


      default:
        break;

    }

  }

}


export type HovercardPosition = 'left' | 'right' | 'top' | 'bottom';