import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from '../../../generated/prisma/enums';

export const RoleSchema = z.enum(Role);

export const CreateUserSchema = z.object({
  email: z.email('Please provide a valid email address').toLowerCase(),
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  firstName: z
    .string('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .trim(),
  lastName: z
    .string('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .trim(),
  role: RoleSchema.optional().default('USER'),
  isActive: z.boolean().default(true),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export type CreateUserDtoType = z.infer<typeof CreateUserSchema>;

/* createZodDto() creates NestJS-compatible DTO classes from Zod schemas
 * These DTOs:
 * - Work with @Body() decorator
 * - Automatic validation
 * - Automatic type inference
 * - Swagger documentation (if using @nestjs/swagger)
 */
