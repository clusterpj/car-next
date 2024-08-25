// File: src/utils/sanitizer.ts

import { escapeRegExp } from 'lodash';  // Make sure to install lodash if not already present

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Remove any characters that could be used for NoSQL injection
    return input.replace(/[${}()]/g, '').trim();
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (typeof input === 'object' && input !== null) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[sanitizeInput(key) as string] = sanitizeInput(value);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return input;
}

export function sanitizeForRegex(input: string): string {
  return escapeRegExp(sanitizeInput(input) as string);
}