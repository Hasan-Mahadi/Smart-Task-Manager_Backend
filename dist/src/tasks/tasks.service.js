"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const task_query_dto_1 = require("./dto/task-query.dto");
const activity_logs_service_1 = require("../activity-logs/activity-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const role_enum_1 = require("../common/enums/role.enum");
let TasksService = class TasksService {
    constructor(prisma, activityLogs, notifications) {
        this.prisma = prisma;
        this.activityLogs = activityLogs;
        this.notifications = notifications;
    }
    async create(dto, userId, userRole) {
        if (userRole === role_enum_1.Role.TEAM_MEMBER) {
            throw new common_1.ForbiddenException('Team members cannot create tasks');
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
    async findAll(query, user) {
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
    async findOne(id, user) {
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
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        await this.ensureTaskAccess(task.projectId, user);
        return task;
    }
    async update(id, dto, user) {
        const task = await this.findOne(id, user);
        if (dto.title && dto.title !== task.title) {
            await this.checkDuplicateTitle(task.projectId, dto.title, id);
        }
        if (dto.assignedToId !== undefined &&
            dto.assignedToId !== task.assignedToId) {
            if (task.status === 'COMPLETED') {
                throw new common_1.BadRequestException('Completed tasks cannot be reassigned.');
            }
            if (user.role === role_enum_1.Role.TEAM_MEMBER) {
                throw new common_1.ForbiddenException('Team members cannot reassign tasks');
            }
        }
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            const allowed = ['status'];
            const keys = Object.keys(dto);
            if (keys.some((k) => !allowed.includes(k))) {
                throw new common_1.ForbiddenException('Team members can only update status');
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
        const action = dto.status === 'COMPLETED' ? 'Task Completed' : 'Task Updated';
        await this.activityLogs.log({
            action,
            userId: user.id,
            projectId: task.projectId,
            taskId: id,
        });
        if (dto.assignedToId &&
            dto.assignedToId !== task.assignedToId) {
            await this.activityLogs.log({
                action: 'Task Assigned',
                userId: user.id,
                projectId: task.projectId,
                taskId: id,
            });
            await this.notifyAssignment(updated);
        }
        if (dto.status === 'COMPLETED' && task.assignedToId) {
            await this.notifications.create(task.createdById, 'Task Completion', `Task "${task.title}" has been completed`);
        }
        return updated;
    }
    async remove(id, user) {
        const task = await this.findOne(id, user);
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            throw new common_1.ForbiddenException('Team members cannot delete tasks');
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
    async checkDuplicateTitle(projectId, title, excludeId) {
        const existing = await this.prisma.task.findFirst({
            where: {
                projectId,
                title: { equals: title, mode: 'insensitive' },
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('This task already exists in the project.');
        }
    }
    async notifyAssignment(task) {
        if (!task.assignedToId)
            return;
        await this.notifications.create(task.assignedToId, 'Task Assignment', `You have been assigned to task "${task.title}" in project "${task.project.name}"`);
    }
    async ensureTaskAccess(projectId, user) {
        if (user.role === role_enum_1.Role.ADMIN)
            return;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const hasAccess = project.createdById === user.id ||
            project.members.some((m) => m.userId === user.id);
        if (!hasAccess)
            throw new common_1.ForbiddenException('Access denied');
    }
    buildWhere(query, user) {
        const where = {};
        const now = new Date();
        if (query.projectId)
            where.projectId = query.projectId;
        if (query.status)
            where.status = query.status;
        if (query.priority)
            where.priority = query.priority;
        if (query.assignedToId)
            where.assignedToId = query.assignedToId;
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.deadlineStatus === task_query_dto_1.DeadlineStatus.OVERDUE) {
            where.dueDate = { lt: now };
            where.status = { not: 'COMPLETED' };
        }
        else if (query.deadlineStatus === task_query_dto_1.DeadlineStatus.UPCOMING) {
            where.dueDate = { gte: now };
        }
        else if (query.deadlineStatus === task_query_dto_1.DeadlineStatus.NO_DEADLINE) {
            where.dueDate = null;
        }
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            where.assignedToId = user.id;
        }
        return where;
    }
    getOrderBy(sort) {
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
    taskInclude() {
        return {
            project: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true, avatar: true } },
            createdBy: { select: { id: true, name: true } },
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_logs_service_1.ActivityLogsService,
        notifications_service_1.NotificationsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map