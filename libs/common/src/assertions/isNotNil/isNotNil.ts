import isNil from '../isNil';

const isNotNil = (value: unknown): value is NonNullable<unknown> => !isNil(value);

export default isNotNil;
