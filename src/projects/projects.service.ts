import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        status: dto.status || 'ACTIVE',
        createdById: userId,
        members: { create: { userId } },
      },
      include: this.projectInclude(),
    });

    await this.activityLogs.log({
      action: 'Project Created',
      userId,
      projectId: project.id,
    });

    return project;
  }

  async findAll(query: ProjectQueryDto, user: { id: string; role: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (user.role !== Role.ADMIN) {
      where.OR = [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ];
    }

    const orderBy = this.getOrderBy(query.sort);

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          _count: { select: { tasks: true, members: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ...this.projectInclude(),
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    this.ensureAccess(project, user);
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    user: { id: string; role: string },
  ) {
    const project = await this.findOne(id, user);
    if (
      user.role === Role.TEAM_MEMBER &&
      project.createdById !== user.id
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
      include: this.projectInclude(),
    });

    await this.activityLogs.log({
      action: 'Project Updated',
      userId: user.id,
      projectId: id,
    });

    return updated;
  }

  async remove(id: string, user: { id: string; role: string }) {
    await this.findOne(id, user);
    if (user.role === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Insufficient permissions');
    }
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }

  async addMember(
    projectId: string,
    memberUserId: string,
    user: { id: string; role: string },
  ) {
    await this.findOne(projectId, user);
    if (user.role === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const member = await this.prisma.projectMember.create({
      data: { projectId, userId: memberUserId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    await this.activityLogs.log({
      action: 'Member Added',
      userId: user.id,
      projectId,
    });

    await this.notifications.create(
      memberUserId,
      'Project Invitation',
      `You have been added to project "${project?.name}"`,
    );

    return member;
  }

  async removeMember(
    projectId: string,
    memberUserId: string,
    user: { id: string; role: string },
  ) {
    await this.findOne(projectId, user);
    if (user.role === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.projectMember.deleteMany({
      where: { projectId, userId: memberUserId },
    });

    await this.activityLogs.log({
      action: 'Member Removed',
      userId: user.id,
      projectId,
    });

    return { message: 'Member removed successfully' };
  }

  private projectInclude() {
    return {
      createdBy: { select: { id: true, name: true, avatar: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        },
      },
    };
  }

  private ensureAccess(
    project: { createdById: string; members: { userId: string }[] },
    user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN) return;
    const isMember =
      project.createdById === user.id ||
      project.members.some((m) => m.userId === user.id);
    if (!isMember) throw new ForbiddenException('Access denied');
  }

  private getOrderBy(sort?: string) {
    switch (sort) {
      case 'nearest_deadline':
        return { deadline: 'asc' as const };
      case 'recently_updated':
        return { createdAt: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  }
}
