import { describe, it, expect } from 'vitest';
import api, { getErrorMessage } from '../lib/api';

describe('API Client', () => {
  it('should have default baseURL and headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.withCredentials).toBe(true);
  });

  describe('getErrorMessage helper', () => {
    it('should return error string if standard Error is passed', () => {
      const err = new Error('Custom failure message');
      expect(getErrorMessage(err)).toBe('Custom failure message');
    });

    it('should return fallback message if non-error object is passed', () => {
      expect(getErrorMessage(null, 'Fallback message')).toBe('Fallback message');
      expect(getErrorMessage(undefined, 'Fallback message')).toBe('Fallback message');
    });

    it('should handle simulated Axios error structure', () => {
      const fakeAxiosError = {
        isAxiosError: true,
        response: {
          data: {
            error: 'Invalid credentials',
          },
        },
      };
      // Testing with custom shape
      expect(getErrorMessage(fakeAxiosError, 'Default')).toBe('Invalid credentials');
    });
  });
});
