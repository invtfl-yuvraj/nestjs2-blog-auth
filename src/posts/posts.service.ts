import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import {
  CreatePostDto,
  CreatePostSchema,
  PostQueryDto,
  UpdatePostDto,
  UpdatePostSchema,
} from './dto/post.dto';
import { CreatePostType, PaginatedPosts, PostEntity } from './types/post.type';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async create(data: CreatePostDto, authorId: string): Promise<PostEntity> {
    return this.postsRepository.create({
      ...data,
      authorId,
    });
  }

  async findAll(
    query: PostQueryDto,
    userRole?: string,
  ): Promise<PaginatedPosts> {
    // Build where clause
    const where: any = {};

    // Only show published posts to non-admin/editor users
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      where.published = true;
    } else if (query.published !== undefined) {
      where.published = query.published;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Get total count for pagination
    const total = await this.postsRepository.count(where);

    // Get posts
    const posts = await this.postsRepository.findMany(where, skip, query);

    // Return paginated response
    return {
      data: posts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string): Promise<PostEntity> {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  //   Find user's posts with pagination
  async findMyPosts(
    authorId: string,
    query: PostQueryDto,
  ): Promise<PaginatedPosts> {
    const where: any = { authorId };

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Get total count for pagination
    const total = await this.postsRepository.count(where);

    const posts = await this.postsRepository.findMany(where, skip, query);

    // Return paginated response
    return {
      data: posts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(
    id: string,
    data: UpdatePostDto,
    userId: string,
    userRole: string,
  ): Promise<PostEntity> {
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    // Check permissions
    if (existingPost.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.postsRepository.update(id, data);
    return updatedPost;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const existingPost = await this.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check permissions
    if (existingPost.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.delete(id);
  }

  async togglePublish(id: string, userRole: string): Promise<PostEntity> {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      throw new ForbiddenException('Only admins and editors can publish posts');
    }

    const post = await this.findOne(id);

    return this.postsRepository.update(id, {
      published: !post.published,
    });
  }

  // ADVANCED: USING ZOD IN SERVICES

  async updatePartial(id: string, partialData: unknown): Promise<PostEntity> {
    // Validate partial update
    const result = UpdatePostSchema.safeParse(partialData);

    if (!result.success) {
      throw new Error('Invalid update data');
    }

    return this.postsRepository.update(id, result.data);
  }

  async createWithTransformation(
    data: CreatePostType,
    authorId: string,
  ): Promise<PostEntity> {
    const { z } = await import('zod');

    /**
     * Custom transformation schema
     * Sanitize content before saving
     */
    const SanitizedSchema = z.object({
      title: z.string(),
      content: z.string().transform((content) => {
        // Remove HTML tags (simple example)
        return content.replace(/<[^>]*>/g, '');
      }),
      published: z.boolean(),
      tags: z.array(z.string()),
    });

    const sanitized = SanitizedSchema.parse(data);

    return this.create(sanitized, authorId);
  }

  //   Schema as Documentation
  explainSchema() {
    /**
     * You can introspect schemas for documentation:
     * - Required fields
     * - Min/max constraints
     * - Default values
     * - Enum options
     *
     * Useful for:
     * - Auto-generating API docs
     * - Client-side validation
     * - Testing
     */

    const shape = CreatePostSchema.shape;
    // shape.title, shape.content, etc.
  }
}
