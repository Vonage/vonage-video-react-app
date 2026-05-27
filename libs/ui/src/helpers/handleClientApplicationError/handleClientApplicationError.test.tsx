import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import handleClientApplicationError from './handleClientApplicationError';
import ApplicationClientError from '@core/errors/ApplicationClientError/ApplicationClientError';
import notifications$ from '@core/stores/notifications/notifications$';

describe('handleClientApplicationError', () => {
  it('pushes warning notifications with children for string and ZodIssue issues', () => {
    const { result } = renderHook(() => notifications$.use());

    const stringIssueError = new ApplicationClientError({
      src: { message: 'Validation failed', issues: ['Field is required'] },
      fallbackConfig: { fallbackMessage: 'Fallback' },
    });

    const zodIssueError = new ApplicationClientError({
      src: {
        message: 'Invalid input',
        issues: [
          {
            code: 'invalid_type',
            path: ['email'],
            message: 'Expected string',
            expected: 'string',
            received: 'number',
          },
        ],
      },
      fallbackConfig: { fallbackMessage: 'Fallback' },
    });

    act(() => {
      handleClientApplicationError(stringIssueError);
      handleClientApplicationError(zodIssueError);
    });

    const entries = [...result.current[0].notifications.values()];
    expect(entries).toHaveLength(2);
    entries.forEach((entry) => {
      expect(entry.type).toBe('warning');
      expect(entry.children).not.toBeUndefined();
    });
  });
});
