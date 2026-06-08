import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, userId: string) {
    return this.prisma.comment.create({
      data: {
        taskId: dto.taskId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
