import { jest } from '@jest/globals';

const mockState = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  expire: jest.fn(),
  increment: jest.fn(),
};

const mockVcr = {
  getInstanceState: jest.fn(() => mockState),
  getAccountState: jest.fn(() => mockState),
};

export const vcr = mockVcr;
