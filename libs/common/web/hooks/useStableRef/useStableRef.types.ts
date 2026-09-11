export const stable_ref_unique_symbol = Symbol('stable_ref_unique_symbol');

export type RefCreator<T> = () => T;

export type CleanupFunction<T> = (value: T) => void;
