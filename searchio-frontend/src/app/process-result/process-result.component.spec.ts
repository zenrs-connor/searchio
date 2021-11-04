import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessResultComponent } from './process-result.component';

describe('ProcessResultComponent', () => {
  let component: ProcessResultComponent;
  let fixture: ComponentFixture<ProcessResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
