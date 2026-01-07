import { CreateUserSchema } from './create-user.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true,
});

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string('Current password is required'),
    newPassword: z
      .string('New password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password is too long'),
    confirmPassword: z.string('Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {}

export type UpdateUserDtoType = z.infer<typeof UpdateUserSchema>;
export type UpdatePasswordDtoType = z.infer<typeof UpdatePasswordSchema>;
