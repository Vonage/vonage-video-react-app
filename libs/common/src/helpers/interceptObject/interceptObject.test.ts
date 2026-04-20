import { describe, expect, it } from 'vitest';
import interceptObject from './';

type CounterService = {
  value: number;
  label: string;
  summary: string;
  increment: (step: number) => number;
  readValue: () => number;
};

describe('interceptObject', () => {
  it('should replace the target with a proxy and preserve bound original methods', () => {
    const container = makeContainer(1);

    const envelope = interceptObject(container, 'service');
    const increment = container.service.increment;

    expect(envelope.proxy).toBe(container.service);
    expect(container.service.summary).toBe('counter:1');
    expect(increment).toBe(container.service.increment);
    expect(increment(2)).toBe(3);

    const readValue = envelope.getOriginal('readValue');

    expect(readValue).toBe(envelope.getOriginal('readValue'));
    expect(readValue()).toBe(3);
  });

  it('should apply and remove overrides for destructured methods', () => {
    const container = makeContainer(4);
    const envelope = interceptObject(container, 'service');
    const increment = container.service.increment;

    envelope.override('increment', ({ target, handler }) => {
      expect(target.value).toBe(4);

      return (step) => handler(step * 2);
    });

    expect(increment(3)).toBe(10);

    envelope.removeOverride('increment');

    expect(increment(1)).toBe(11);

    const unsubscribe = envelope.override('increment', ({ handler }) => {
      return (step) => handler(step) + 100;
    });

    expect(increment(1)).toBe(112);

    unsubscribe();

    expect(increment(1)).toBe(13);
  });

  it('should refresh original bindings when rebound to a fresh container', () => {
    const initialContainer = makeContainer(2);
    const envelope = interceptObject(initialContainer, 'service');
    const proxiedIncrement = initialContainer.service.increment;

    expect(envelope.getOriginal('readValue')()).toBe(2);

    const freshContainer = makeContainer(20);

    envelope.rebind(freshContainer);

    expect(envelope.getOriginal('readValue')()).toBe(20);

    envelope.override('increment', ({ target, handler }) => {
      expect(target).toBe(freshContainer.service);

      return (step) => handler(step) + 100;
    });

    expect(envelope.getOriginal('increment')(1)).toBe(21);
    expect(freshContainer.service.value).toBe(21);
    expect(proxiedIncrement(1)).toBe(122);
    expect(freshContainer.service.value).toBe(22);
  });

  it('should return a null proxy when the target object is missing', () => {
    const container = {
      service: null as unknown as CounterService,
    };

    const envelope = interceptObject(container, 'service');

    expect(envelope.proxy).toBeNull();
    expect(envelope.getOriginal('readValue')).toBeUndefined();

    envelope.rebind({ service: makeService(8) });

    expect(envelope.getOriginal('readValue')()).toBe(8);
  });
});

function makeContainer(value: number): { service: CounterService } {
  return {
    service: makeService(value),
  };
}

function makeService(value: number): CounterService {
  return {
    value,
    label: 'counter',
    get summary() {
      return `${this.label}:${this.value}`;
    },
    increment(step) {
      this.value += step;
      return this.value;
    },
    readValue() {
      return this.value;
    },
  };
}
