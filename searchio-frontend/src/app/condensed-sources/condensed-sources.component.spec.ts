import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensedSourcesComponent } from './condensed-sources.component';

describe('CondensedSourcesComponent', () => {
  let component: CondensedSourcesComponent;
  let fixture: ComponentFixture<CondensedSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CondensedSourcesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensedSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
