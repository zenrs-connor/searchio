import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'condensed-sources',
  templateUrl: './condensed-sources.component.html',
  styleUrls: ['./condensed-sources.component.sass']
})
export class CondensedSourcesComponent {

  @Input() sources: string[] = []

  constructor() { }

}
