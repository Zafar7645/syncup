/**
 * @file password.constants.ts
 * @description Shared password validation constants. The regex enforces: minimum 8
 * characters, at least one uppercase, one lowercase, one digit, and one special
 * character from !@#$%^&*(). Both the backend DTO and the frontend form validator
 * import these constants so the rule is defined exactly once.
 */
export const PASSWORD_REGEX_STRING: string =
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()]).{8,}$';

export const PASSWORD_VALIDATION_MESSAGE: string =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.';
