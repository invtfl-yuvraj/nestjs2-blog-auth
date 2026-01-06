import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '../../users/dto/create-user.dto';

// Login Schema

export const LoginSchema = z.object({
  email: z
    .email('Invalid email format. Example: user@example.com')
    .min(1, 'Email cannot be empty')
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, 'Password cannot be empty')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const RegisterSchema = CreateUserSchema;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string('Refresh token is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.email('Please provide a valid email').toLowerCase(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string('Reset token is required'),
    password: z
      .string('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password is too long'),
    confirmPassword: z.string('Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const VerifyEmailSchema = z.object({
  token: z.string('Verification token is required'),
});

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['ADMIN', 'EDITOR', 'USER']),
  }),
});

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}

export type LoginType = z.infer<typeof LoginSchema>;
export type RegisterType = z.infer<typeof RegisterSchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

// Strip unknown fields (security)
export const StrictLoginSchema = LoginSchema.strict();
