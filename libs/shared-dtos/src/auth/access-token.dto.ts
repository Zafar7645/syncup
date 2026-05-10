/**
 * @file access-token.dto.ts
 * @description Response shape returned by POST /auth/login. Contains a signed JWT
 * that the frontend stores in localStorage and attaches to subsequent requests.
 */
export class AccessTokenDto {
  readonly access_token!: string;
}
