import { z } from 'zod';

import { Post } from '../../../generated/prisma/client';
import {
  CreatePostSchema,
  PaginatedPostsSchema,
  PostQuerySchema,
  PostResponseSchema,
  UpdatePostSchema,
} from '../dto/post.dto';

export type PostEntity = Post;
export type PostWithAuthorEntity = PostEntity & {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
};

export type CreatePostType = z.output<typeof CreatePostSchema>;
export type UpdatePostType = z.output<typeof UpdatePostSchema>;
export type PostQueryType = z.infer<typeof PostQuerySchema>;

export type PostResponse = z.infer<typeof PostResponseSchema>;
export type PaginatedPosts = z.infer<typeof PaginatedPostsSchema>;
