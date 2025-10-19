/**
 * Data transfer object for user responses.
 * Excludes sensitive fields like password hash.
 */
export class UserResponseDto {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
