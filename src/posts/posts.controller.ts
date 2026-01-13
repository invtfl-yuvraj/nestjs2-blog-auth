import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as PostMethod,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  CreatePostSchema,
  PostQueryDto,
  UpdatePostDto,
} from './dto/post.dto';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../comman/guards/roles.guard';
import { Role } from '../../generated/prisma/enums';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts [Get all user's posts with pagination]
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PostQueryDto, @Request() req) {
    /**
     * Zod automatically validates and transforms query params:
     *
     * Input: { page: "2", limit: "20", published: "true" }
     * After Zod: { page: 2, limit: 20, published: true }
     *            ^^^^^^^ Numbers! ^^^^ Boolean!
     *
     * Invalid input:
     * /posts?page=abc → 400 Bad Request: "Page must be a number"
     * /posts?limit=500 → 400 Bad Request: "Number must be less than or equal to 100"
     */

    const user = req.user as JwtPayloadDto;
    const userRole = user?.role;
    return this.postsService.findAll(query, userRole);
  }

  // GET /posts/my-posts [Get current user's posts with pagination]
  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@Query() query: PostQueryDto, @Request() req) {
    const user = req.user as JwtPayloadDto;
    return this.postsService.findMyPosts(user.userId, query);
  }

  // GET /posts/:id [Get specific post]
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  // POST /posts [Create new post (Editor/Admin only)]
  @PostMethod()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    const user = req.user as JwtPayloadDto;
    return this.postsService.create(createPostDto, user.userId);
  }

  // PATCH /posts/:id [Update post (Author or Admin)]
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const user = req.user as JwtPayloadDto;
    return this.postsService.update(id, updatePostDto, user.userId, user.role);
  }

  // PATCH /posts/:id/publish [Toggle publish status (Editor/Admin only)]
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async togglePublish(@Param('id') id: string, @Request() req) {
    const user = req.user as JwtPayloadDto;
    return this.postsService.togglePublish(id, user.role);
  }

  // DELETE /posts/:id [Delete post (Author or Admin)]
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const user = req.user as JwtPayloadDto;
    await this.postsService.remove(id, user.userId, user.role);
    return { message: 'Post deleted successfully' };
  }

  /* 
    ADVANCED: BATCH OPERATIONS WITH ZOD
  */

  // POST /posts/batch [Create multiple posts at once]
  @PostMethod('batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createBatch(@Body() posts: CreatePostDto[], @Request() req) {
    /**
     * Zod validates array of posts
     * Each post must match CreatePostDto schema
     *
     * Request body:
     * [
     *   { "title": "Post 1", "content": "Content 1..." },
     *   { "title": "Post 2", "content": "Content 2..." }
     * ]
     */
    const user = req.user as JwtPayloadDto;
    return Promise.all(
      posts.map((post) => this.postsService.create(post, user.userId)),
    );
  }

  // POST /posts/validate [Test endpoint to manually validate data]

  @PostMethod('validate')
  validatePost(@Body() data: unknown) {
    /**
     * Manual validation with Zod
     * Useful when you need custom error handling
     */

    // safeParse doesn't throw, returns result object
    const result = CreatePostSchema.safeParse(data);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          received: issue.code,
        })),
      };
    }

    return {
      valid: true,
      data: result.data,
    };
  }
}
