import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesContainerComponent } from './queries-container.component';

describe('QueriesContainerComponent', () => {
  let component: QueriesContainerComponent;
  let fixture: ComponentFixture<QueriesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueriesContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueriesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
