// File: __tests__/utils/sanitizer.test.ts

import { sanitizeInput, sanitizeForRegex } from '@/utils/sanitizer';

describe('sanitizeInput', () => {
  it('should remove potentially dangerous characters', () => {
    const input = '<script>alert("XSS")</script>';
    expect(sanitizeInput(input)).not.toContain('<script>');
  });

  it('should handle objects recursively', () => {
    const input = { key: '<img src=x onerror=alert("XSS")>' };
    const sanitized = sanitizeInput(input) as { key: string };
    expect(sanitized.key).not.toContain('onerror');
  });
});

describe('sanitizeForRegex', () => {
  it('should escape special regex characters', () => {
    const input = 'a.*$^+?()[]{}|\\';
    const sanitized = sanitizeForRegex(input);
    expect(sanitized).toBe('a\\.\\*\\$\\^\\+\\?\\(\\)\\[\\]\\{\\}\\|\\\\');
  });
});
