import { describe, it, expect } from 'vitest';
import SessionKeySchema from './SessionKey.schema';

const validSessionKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiIxX01YNWtNVEkxWWpGbU1DMWtZMkl5TFRRM05EY3RZamxrWVMxa09ESTVOMkk0WkdFME9UZC1makUzTnpVM09UWXhOVGd3TWpkLWFqaElOU3RYZEV4VU5sYzBZbE5vZGs5UVNYVllVRmRDZm41LSIsInJvb21OYW1lIjoiYXdlc29tZS1yb29tLW5hbWUiLCJpYXQiOjE3NzU5NjMzMjh9.QcNVXp6gatPTV82IJa8VgDG6rOLBkFjU3r7j_BcxM-c';

describe('SessionKeySchema', () => {
  it('should accept a valid session key', () => {
    expect(SessionKeySchema.safeParse(validSessionKey).success).toBe(true);
  });

  it('should reject an invalid session key', () => {
    expect(SessionKeySchema.safeParse('not-a-session-key').success).toBe(false);
  });
});
