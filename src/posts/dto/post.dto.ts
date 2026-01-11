import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CreatePostType } from '../types/post.type';

export const CreatePostSchema = z.object({
  title: z
    .string('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  content: z
    .string('Content is required')
    .min(10, 'Content must be at least 10 characters')
    .trim(),
  published: z.boolean().optional().default(false),
  tags: z
    .array(z.string().min(2).max(20))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const PublishPostSchema = z.object({
  published: z.boolean('Published status is required'),
});

export const PostQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default(1),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(10),

  // Filters
  published: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  authorId: z.uuid().optional(),

  search: z.string().min(2).optional(),

  // Sorting
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title'])
    .optional()
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
export class UpdatePostDto extends createZodDto(UpdatePostSchema) {}
export class PublishPostDto extends createZodDto(PublishPostSchema) {}
export class PostQueryDto extends createZodDto(PostQuerySchema) {}

export const PostAuthorSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
});

export const PostResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: PostAuthorSchema,
});

// Paginated posts response
export const PaginatedPostsSchema = z.object({
  data: z.array(PostResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const SmartCreatePostSchema = z
  .object({
    title: z
      .string('Title is required')
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    content: z
      .string('Content is required')
      .min(10, 'Content must be at least 10 characters')
      .trim(),
    published: z.boolean().optional().default(false),
    tags: z
      .array(z.string().min(2).max(20))
      .max(10, 'Cannot have more than 10 tags')
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      // If publishing, content must be at least 100 chars
      if (data.published) {
        return data.content.length >= 100;
      }
      return true;
    },
    {
      message: 'Published posts must have at least 100 characters of content',
      path: ['content'],
    },
  )
  .refine(
    (data) => {
      // If publishing, must have at least one tag
      if (data.published) {
        return data.tags.length > 0;
      }
      return true;
    },
    {
      message: 'Published posts must have at least one tag',
      path: ['tags'],
    },
  );

// Different schemas based on post type

export const ArticleSchema = z.object({
  type: z.literal('article'),
  title: z.string().min(5),
  content: z.string().min(100),
  readTime: z.number().min(1), // Reading time in minutes
});

export const VideoSchema = z.object({
  type: z.literal('video'),
  title: z.string().min(5),
  videoUrl: z.string().url(),
  duration: z.number().min(1), // Duration in seconds
});

export const PhotoSchema = z.object({
  type: z.literal('photo'),
  title: z.string().min(5),
  imageUrl: z.string().url(),
  caption: z.string().max(500),
});

// Discriminated union - validates based on 'type' field
export const PostContentSchema = z.discriminatedUnion('type', [
  ArticleSchema,
  VideoSchema,
  PhotoSchema,
]);

/**
 * ================================================
 * USAGE IN CONTROLLER
 * ================================================
 *
 * // Simple POST request
 * @Post()
 * async create(
 *   @Body() createPostDto: CreatePostDto,
 *   @Request() req,
 * ): Promise<PostResponse> {
 *   return this.postsService.create(createPostDto, req.user.id);
 * }
 *
 * // With query parameters
 * @Get()
 * async findAll(
 *   @Query() query: PostQueryDto,
 * ): Promise<PaginatedPosts> {
 *   // query is validated and transformed
 *   // page and limit are numbers (not strings)
 *   // published is boolean (not string)
 *   return this.postsService.findAll(query);
 * }
 *
 * // URL: /posts?page=2&limit=20&published=true&sortBy=title
 * // query = {
 * //   page: 2,        // transformed from "2" to number
 * //   limit: 20,      // transformed from "20" to number
 * //   published: true, // transformed from "true" to boolean
 * //   sortBy: "title",
 * //   sortOrder: "desc"
 * // }
 */

/**
 * ================================================
 * MANUAL VALIDATION IN SERVICES
 * ================================================
 */

// Example: Validate data from external source
export function validatePostData(data: unknown): CreatePostType {
  const result = CreatePostSchema.safeParse(data);
  //   safeParse() for manual validation

  if (!result.success) {
    // Handle validation errors
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    throw new Error(`Invalid post data: ${JSON.stringify(errors)}`);
  }

  return result.data; // Typed and validated
}

/**
 * ================================================
 * ZOD TRANSFORMATIONS
 * ================================================
 */

// Sanitize HTML content
export const SanitizedPostSchema = CreatePostSchema.extend({
  content: z
    .string()
    .min(10)
    .transform((content) => {
      // Remove script tags
      return content.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '',
      );
    }),
});

// Auto-generate slug from title
export const PostWithSlugSchema = CreatePostSchema.extend({
  slug: z.string().optional(),
}).transform((data) => {
  if (!data.slug) {
    return {
      ...data,
      slug: data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    };
  }
  return data;
});

/**
 * ================================================
 * TESTING SCHEMAS
 * ================================================
 */

// Mock data for testing
export const mockCreatePostData: CreatePostType = {
  title: 'Test Post Title',
  content: 'This is test content with more than 10 characters.',
  published: false,
  tags: ['test', 'sample'],
};

// Factory function for test data
export function createMockPost(
  overrides?: Partial<CreatePostType>,
): CreatePostType {
  return CreatePostSchema.parse({
    ...mockCreatePostData,
    ...overrides,
  });
}
