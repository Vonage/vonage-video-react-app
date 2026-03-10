import makeVideoApiErrorHandler from './makeVideoApiErrorHandler';

describe('makeVideoApiErrorHandler', () => {
  const safeMessage = 'This is a safe message';
  const unsafeMessage = 'This is an unhandled error';

  const handler = makeVideoApiErrorHandler(safeMessage);

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  it('should correctly handle string errors', () => {
    const src = 'This is a string error';
    const error = handler(src).exportSafely();

    expect(error.message).toBe(src);
  });

  it('should correctly handle unknown errors', () => {
    const src = new Error(unsafeMessage);
    const error = handler(src).exportSafely();

    expect(error.message).toBe(safeMessage);
    expect(error.values).toEqual([unsafeMessage]);
  });

  it('should correctly handle application errors', () => {
    const src = 'This is an application error';
    const applicationError = handler(src);
    const error = handler(applicationError).exportSafely();

    expect(error.message).toBe(src);
    expect(error.values).toEqual([]);
  });

  it('should correctly handle opentok errors', () => {
    const src = {
      message: 'Unexpected response from OpenTok: "{"message":"The url structure must be valid."}"',
    };

    const applicationError = handler(src);
    const error = applicationError.exportSafely();

    expect(error.message).toBe('Unexpected response from OpenTok');
    expect(error.values).toEqual(['The url structure must be valid.']);
  });
});
