import { describe, it, expect } from 'vitest';
import { getFormattedDate, getFormattedTime } from './dateTime';

const timestamp = new Date('December 1, 2025 21:12:00').getTime();

describe('dateTime', () => {
  it('Should render date properly with locale', () => {
    expect(getFormattedDate('en', timestamp)).toEqual('Mon, Dec 1');
    expect(getFormattedDate('fr', timestamp)).toEqual('lun. 1 déc.');
  });

  it('Should render time properly with locale', () => {
    expect(getFormattedTime('en', timestamp)).toEqual('9:12 PM');
    expect(getFormattedTime('fr', timestamp)).toEqual('21:12');
  });
});
