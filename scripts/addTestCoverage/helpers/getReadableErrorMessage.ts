function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unexpected error.';
}

export default getReadableErrorMessage;
