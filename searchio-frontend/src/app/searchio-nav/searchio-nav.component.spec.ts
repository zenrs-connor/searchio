import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchioNavComponent } from './searchio-nav.component';

describe('SearchioNavComponent', () => {
  let component: SearchioNavComponent;
  let fixture: ComponentFixture<SearchioNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchioNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchioNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
