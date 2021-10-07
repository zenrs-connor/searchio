import { Component, Input, OnInit } from '@angular/core';
import { Process } from '../models/Process';

@Component({
  selector: 'list-process',
  templateUrl: './list-process.component.html',
  styleUrls: ['./list-process.component.sass']
})
export class ListProcessComponent {

  @Input() process: Process | undefined;

  constructor() { }

}
