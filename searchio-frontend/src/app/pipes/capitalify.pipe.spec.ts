import { CapitalifyPipe } from './capitalify.pipe';

describe('CapitalifyPipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalifyPipe();
    expect(pipe).toBeTruthy();
  });
});
