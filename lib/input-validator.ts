// lib/input-validator.ts
/**
 * Centralized Input Validation and Sanitization Utilities
 * Protects against NoSQL injection and other input-based attacks
 */

/**
 * Ensures a value is a primitive string, not an object or MongoDB operator
 * Prevents NoSQL injection attacks
 */
export function sanitizeMongoInput(value: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  // ✅ Only allow primitive types (string, number, boolean)
  if (typeof value === 'object') {
    throw new Error('Invalid input: objects are not allowed');
  }

  // Convert to string and trim
  return String(value).trim();
}

/**
 * Validates email format and ensures it's a primitive string
 */
export function validateEmail(email: any): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email: must be a string');
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic email regex validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error('Invalid email format');
  }

  // Additional security: prevent email injection
  if (trimmedEmail.includes('\n') || trimmedEmail.includes('\r')) {
    throw new Error('Invalid email: contains illegal characters');
  }

  return trimmedEmail;
}

/**
 * Validates and parses date safely
 */
export function validateDate(dateInput: any, fieldName: string = 'date'): Date {
  if (!dateInput) {
    throw new Error(`Invalid ${fieldName}: cannot be empty`);
  }

  // Ensure it's a string or number (timestamp)
  if (typeof dateInput === 'object' && !(dateInput instanceof Date)) {
    throw new Error(`Invalid ${fieldName}: objects are not allowed`);
  }

  const parsedDate = new Date(dateInput);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid ${fieldName}: not a valid date`);
  }

  return parsedDate;
}

/**
 * Validates value against allowed enum values
 */
export function validateEnum<T extends string>(
  value: any,
  allowedValues: readonly T[],
  fieldName: string = 'field'
): T {
  // Ensure it's a string
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }

  const trimmedValue = value.trim();

  if (!allowedValues.includes(trimmedValue as T)) {
    throw new Error(
      `Invalid ${fieldName}: must be one of [${allowedValues.join(', ')}]`
    );
  }

  return trimmedValue as T;
}

/**
 * Sanitizes a string input and enforces maximum length
 */
export function sanitizeString(
  value: any,
  maxLength: number = 1000,
  fieldName: string = 'field'
): string {
  const sanitized = sanitizeMongoInput(value);

  if (sanitized === null) {
    return '';
  }

  if (sanitized.length > maxLength) {
    throw new Error(
      `Invalid ${fieldName}: exceeds maximum length of ${maxLength} characters`
    );
  }

  return sanitized;
}

/**
 * Validates that a value is a safe primitive for MongoDB queries
 * Returns the value if safe, throws error if not
 */
export function ensurePrimitive(value: any, fieldName: string = 'field'): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  const type = typeof value;

  // Only allow primitive types
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }

  // Objects (including arrays and MongoDB operators) are not allowed
  if (type === 'object') {
    throw new Error(`Invalid ${fieldName}: objects and operators are not allowed`);
  }

  throw new Error(`Invalid ${fieldName}: unsupported type ${type}`);
}

/**
 * Validates an optional string field
 */
export function validateOptionalString(
  value: any,
  maxLength: number = 1000
): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return sanitizeString(value, maxLength);
}
