import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInjectedComponent } from './service-injected.component';

describe('ServiceInjectedComponent', () => {
  let component: ServiceInjectedComponent;
  let fixture: ComponentFixture<ServiceInjectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceInjectedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceInjectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
