export type StoreListener<TState extends Record<string, unknown>> = {
  equalsRoot?: (prevState: TState, newState: TState) => boolean;
  equalsSelection?: (prevValue: unknown, newValue: unknown) => boolean;
  onStoreChange: () => void;
  previousSelectedValue: unknown;
  selector: (state: TState) => unknown;
};

type Setter<TState extends Record<string, unknown>> = TState | ((prevState: TState) => TState);

/**
 * A simple state management store that allows granular subscriptions to state changes.
 * Listeners can subscribe to specific slices of the state and will only be notified when those slices change.
 * @template TState - The type of the state object managed by the store.
 */
abstract class Store<TState extends Record<string, unknown>> {
  private state: TState;

  listeners: Set<StoreListener<TState>>;

  constructor(initialState: TState) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getSnapshot = () => {
    return this.state;
  };

  setState = (setter: Setter<TState>) => {
    const isFunction = typeof setter === 'function';
    const newState = isFunction ? setter(this.state) : setter;

    assertIsRecordLike(newState, {
      context: 'Set State',
    });

    const previousState = this.state;
    this.state = newState;

    this.listeners.forEach((listener) => {
      const { newSelectedValue, didChange } = evaluateListenerStateChange<TState>({
        listener,
        newState,
        previousState,
      });

      if (!didChange) {
        return;
      }

      // Update listener's previous value
      // eslint-disable-next-line no-param-reassign
      listener.previousSelectedValue = newSelectedValue;

      listener.onStoreChange();
    });
  };

  partialUpdate = (partialSetter: Setter<Partial<TState>>) => {
    const isFunction = typeof partialSetter === 'function';
    const updates = isFunction ? partialSetter(this.state) : partialSetter;

    assertIsRecordLike(updates, {
      context: 'Partial Update',
    });

    this.setState({ ...this.state, ...updates });
  };

  subscribe = (listener: StoreListener<TState>) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };
}

function evaluateListenerStateChange<TState extends Record<string, unknown>>({
  listener,
  newState,
  previousState,
}: {
  listener: StoreListener<TState>;
  newState: TState;
  previousState: TState;
}): {
  newSelectedValue?: unknown;
  didChange: boolean;
} {
  const { selector, equalsRoot, equalsSelection, previousSelectedValue } = listener;

  const isRootEqual = (equalsRoot ?? ((prev, next) => prev === next))?.(previousState, newState);

  if (isRootEqual) {
    return {
      didChange: false,
    };
  }

  const newSelectedValue = selector(newState);

  const isEqualSelectedValue = (equalsSelection ?? ((prev, next) => prev === next))?.(
    newSelectedValue,
    previousSelectedValue
  );

  return {
    newSelectedValue,
    didChange: !isEqualSelectedValue,
  };
}

function assertIsRecordLike<TState extends Record<string, unknown>>(
  value: unknown,
  { context }: { context: string }
): asserts value is TState {
  const isObject = typeof value === 'object';
  const isNotNull = value !== null;
  const isNotArray = !Array.isArray(value);
  const isRecordLike = isObject && isNotNull && isNotArray;

  if (!isRecordLike) {
    throw new Error(`Store error: ${context} must be a record-like object.`);
  }

  const proto = Object.getPrototypeOf(value);
  const isPlainObject = proto === Object.prototype || proto === null;

  if (!isPlainObject) {
    throw new TypeError(`Store error: ${context} must be a plain object without a prototype.`);
  }
}

export default Store;
