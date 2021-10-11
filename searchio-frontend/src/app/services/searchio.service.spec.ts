import { TestBed } from '@angular/core/testing';

import { SearchioService } from './searchio.service';

describe('SearchioService', () => {
  let service: SearchioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
