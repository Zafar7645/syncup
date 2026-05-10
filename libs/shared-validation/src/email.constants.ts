/**
 * @file email.constants.ts
 * @description Shared email validation regex. Used by the backend RegisterUserDto
 * class-validator decorator and by the frontend login/register Reactive Form validators,
 * guaranteeing the same rule applies on both sides.
 */
export const EMAIL_REGEX_STRING: string =
  '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$';
