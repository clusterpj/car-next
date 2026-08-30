// File: src/utils/sanitizer.ts

import { escapeRegExp } from 'lodash' // Make sure to install lodash if not already present

export type SanitizedInput =
  | string
  | number
  | boolean
  | Date
  | SanitizedInput[]
  | { [key: string]: SanitizedInput }
  | null

export function sanitizeInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Remove any characters that could be used for NoSQL injection
    return input.replace(/[${}()]/g, '').trim() as T
  } else if (typeof input === 'number' || typeof input === 'boolean' || input instanceof Date) {
    // Numbers, booleans, and dates can be returned as-is
    return input
  } else if (Array.isArray(input)) {
    // Recursively sanitize array elements
    return input.map(sanitizeInput) as T
  } else if (typeof input === 'object' && input !== null) {
    // Recursively sanitize object properties
    const sanitizedObj: { [key: string]: any } = {}
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeInput(value)
    }
    return sanitizedObj as T
  }
  // For any other type, return null
  return null as T
}

export function sanitizeForRegex(input: string): string {
  return escapeRegExp(sanitizeInput(input))
}