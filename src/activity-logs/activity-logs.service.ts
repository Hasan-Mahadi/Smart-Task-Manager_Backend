import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    action: string;
    userId: string;
    projectId?: string;
    taskId?: string;
  }) {
    return this.prisma.activityLog.create({ data });
  }

  async findRecent(limit = 10, projectId?: string) {
    return this.prisma.activityLog.findMany({
      where: projectId ? { projectId } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }
}
