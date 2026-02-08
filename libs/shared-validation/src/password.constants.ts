export const PASSWORD_REGEX_STRING: string =
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()]).{8,}$';

export const PASSWORD_VALIDATION_MESSAGE: string =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.';
