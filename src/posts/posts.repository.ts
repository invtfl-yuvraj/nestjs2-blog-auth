import { Injectable } from '@nestjs/common';
import { IPostRepository } from '../comman/interfaces/repository.interface';
import { PrismaService } from '../database/prisma.service';
import { CreatePostType, PostEntity } from './types/post.type';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PostsRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<PostEntity | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findByAuthorId(authorId: string): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublished(): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    data: CreatePostType & { authorId: string },
  ): Promise<PostEntity> {
    return this.prisma.post.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<CreatePostType>): Promise<PostEntity> {
    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({
      where: { id },
    });
  }

  // other additional helper methods

  //   Find posts with advanced filtering Supports the validated query params from Zod

  async findMany(options: {
    where?: Prisma.PostWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    include?: Prisma.PostInclude;
  }): Promise<PostEntity[]> {
    return this.prisma.post.findMany(options);
  }

  //   Count posts matching criteria Needed for pagination

  async count(where?: Prisma.PostWhereInput): Promise<number> {
    return this.prisma.post.count({ where });
  }

  //    Search posts by text

  async search(searchTerm: string): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  //   Find posts by tags

  async findByTag(tag: string): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      where: {
        tags: {
          has: tag,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //   Soft delete (mark as deleted but keep in DB) For future implementation

  async softDelete(id: string): Promise<PostEntity> {
    // Would need a 'deletedAt' field in schema
    return this.prisma.post.update({
      where: { id },
      data: {
        // deletedAt: new Date(),
      },
    });
  }
}
