import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DeadlineStatus, TaskQueryDto } from './dto/task-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateTaskDto, userId: string, userRole: string) {
    if (userRole === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Team members cannot create tasks');
    }

    await this.checkDuplicateTitle(dto.projectId, dto.title);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        assignedToId: dto.assignedToId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'MEDIUM',
        status: dto.status || 'TODO',
        createdById: userId,
      },
      include: this.taskInclude(),
    });

    await this.activityLogs.log({
      action: 'Task Created',
      userId,
      projectId: dto.projectId,
      taskId: task.id,
    });

    if (dto.assignedToId) {
      await this.notifyAssignment(task);
    }

    return task;
  }

  async findAll(query: TaskQueryDto, user: { id: string; role: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query, user);
    const orderBy = this.getOrderBy(query.sort);

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.taskInclude(),
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        ...this.taskInclude(),
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    await this.ensureTaskAccess(task.projectId, user);
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    user: { id: string; role: string },
  ) {
    const task = await this.findOne(id, user);

    if (dto.title && dto.title !== task.title) {
      await this.checkDuplicateTitle(task.projectId, dto.title, id);
    }

    if (
      dto.assignedToId !== undefined &&
      dto.assignedToId !== task.assignedToId
    ) {
      if (task.status === 'COMPLETED') {
        throw new BadRequestException(
          'Completed tasks cannot be reassigned.',
        );
      }
      if (user.role === Role.TEAM_MEMBER) {
        throw new ForbiddenException('Team members cannot reassign tasks');
      }
    }

    if (user.role === Role.TEAM_MEMBER) {
      const allowed: (keyof UpdateTaskDto)[] = ['status'];
      const keys = Object.keys(dto) as (keyof UpdateTaskDto)[];
      if (keys.some((k) => !allowed.includes(k))) {
        throw new ForbiddenException('Team members can only update status');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: this.taskInclude(),
    });

    const action =
      dto.status === 'COMPLETED' ? 'Task Completed' : 'Task Updated';
    await this.activityLogs.log({
      action,
      userId: user.id,
      projectId: task.projectId,
      taskId: id,
    });

    if (
      dto.assignedToId &&
      dto.assignedToId !== task.assignedToId
    ) {
      await this.activityLogs.log({
        action: 'Task Assigned',
        userId: user.id,
        projectId: task.projectId,
        taskId: id,
      });
      await this.notifyAssignment(updated);
    }

    if (dto.status === 'COMPLETED' && task.assignedToId) {
      await this.notifications.create(
        task.createdById,
        'Task Completion',
        `Task "${task.title}" has been completed`,
      );
    }

    return updated;
  }

  async remove(id: string, user: { id: string; role: string }) {
    const task = await this.findOne(id, user);
    if (user.role === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Team members cannot delete tasks');
    }
    await this.prisma.task.delete({ where: { id } });
    await this.activityLogs.log({
      action: 'Task Deleted',
      userId: user.id,
      projectId: task.projectId,
      taskId: id,
    });
    return { message: 'Task deleted successfully' };
  }

  private async checkDuplicateTitle(
    projectId: string,
    title: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.task.findFirst({
      where: {
        projectId,
        title: { equals: title, mode: 'insensitive' },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(
        'This task already exists in the project.',
      );
    }
  }

  private async notifyAssignment(task: {
    id: string;
    title: string;
    assignedToId: string | null;
    project: { name: string };
  }) {
    if (!task.assignedToId) return;
    await this.notifications.create(
      task.assignedToId,
      'Task Assignment',
      `You have been assigned to task "${task.title}" in project "${task.project.name}"`,
    );
  }

  private async ensureTaskAccess(
    projectId: string,
    user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN) return;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    const hasAccess =
      project.createdById === user.id ||
      project.members.some((m) => m.userId === user.id);
    if (!hasAccess) throw new ForbiddenException('Access denied');
  }

  private buildWhere(
    query: TaskQueryDto,
    user: { id: string; role: string },
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    const now = new Date();

    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.deadlineStatus === DeadlineStatus.OVERDUE) {
      where.dueDate = { lt: now };
      where.status = { not: 'COMPLETED' };
    } else if (query.deadlineStatus === DeadlineStatus.UPCOMING) {
      where.dueDate = { gte: now };
    } else if (query.deadlineStatus === DeadlineStatus.NO_DEADLINE) {
      where.dueDate = null;
    }

    if (user.role === Role.TEAM_MEMBER) {
      where.assignedToId = user.id;
    }

    return where;
  }

  private getOrderBy(sort?: string): Record<string, 'asc' | 'desc'> {
    switch (sort) {
      case 'nearest_deadline':
        return { dueDate: 'asc' };
      case 'highest_priority':
        return { priority: 'asc' };
      case 'recently_updated':
        return { updatedAt: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private taskInclude() {
    return {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    };
  }
}
