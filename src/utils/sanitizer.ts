// File: src/utils/sanitizer.ts

import { escapeRegExp } from 'lodash';  // Make sure to install lodash if not already present

export type SanitizedInput = string | number | boolean | Date | SanitizedInput[] | { [key: string]: SanitizedInput } | null;
export function sanitizeInput(input: unknown): SanitizedInput {
  if (typeof input === 'string') {
    // Remove any characters that could be used for NoSQL injection
    return input.replace(/[${}()]/g, '').trim();
  } else if (typeof input === 'number' || typeof input === 'boolean') {
    // Numbers and booleans can be returned as-is
    return input;
  } else if (input instanceof Date) {
    // Dates can be returned as-is
    return input;
  } else if (Array.isArray(input)) {
    // Recursively sanitize array elements
    return input.map(sanitizeInput);
  } else if (typeof input === 'object' && input !== null) {
    // Recursively sanitize object properties
    const sanitizedObj: { [key: string]: SanitizedInput } = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[sanitizeInput(key) as string] = sanitizeInput(value);
    }
    return sanitizedObj;
  }
  // For any other type, return null
  return null;
}

export function sanitizeForRegex(input: string): string {
  return escapeRegExp(sanitizeInput(input) as string);
}