import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchioResultsComponent } from './searchio-results.component';

describe('SearchioResultsComponent', () => {
  let component: SearchioResultsComponent;
  let fixture: ComponentFixture<SearchioResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchioResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchioResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
