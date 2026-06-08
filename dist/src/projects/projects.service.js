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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const activity_logs_service_1 = require("../activity-logs/activity-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const role_enum_1 = require("../common/enums/role.enum");
let ProjectsService = class ProjectsService {
    constructor(prisma, activityLogs, notifications) {
        this.prisma = prisma;
        this.activityLogs = activityLogs;
        this.notifications = notifications;
    }
    async create(dto, userId) {
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
    async findAll(query, user) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (user.role !== role_enum_1.Role.ADMIN) {
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
    async findOne(id, user) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.ensureAccess(project, user);
        return project;
    }
    async update(id, dto, user) {
        const project = await this.findOne(id, user);
        if (user.role === role_enum_1.Role.TEAM_MEMBER &&
            project.createdById !== user.id) {
            throw new common_1.ForbiddenException('Insufficient permissions');
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
    async remove(id, user) {
        await this.findOne(id, user);
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        await this.prisma.project.delete({ where: { id } });
        return { message: 'Project deleted successfully' };
    }
    async addMember(projectId, memberUserId, user) {
        await this.findOne(projectId, user);
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            throw new common_1.ForbiddenException('Insufficient permissions');
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
        await this.notifications.create(memberUserId, 'Project Invitation', `You have been added to project "${project?.name}"`);
        return member;
    }
    async removeMember(projectId, memberUserId, user) {
        await this.findOne(projectId, user);
        if (user.role === role_enum_1.Role.TEAM_MEMBER) {
            throw new common_1.ForbiddenException('Insufficient permissions');
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
    projectInclude() {
        return {
            createdBy: { select: { id: true, name: true, avatar: true } },
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
                },
            },
        };
    }
    ensureAccess(project, user) {
        if (user.role === role_enum_1.Role.ADMIN)
            return;
        const isMember = project.createdById === user.id ||
            project.members.some((m) => m.userId === user.id);
        if (!isMember)
            throw new common_1.ForbiddenException('Access denied');
    }
    getOrderBy(sort) {
        switch (sort) {
            case 'nearest_deadline':
                return { deadline: 'asc' };
            case 'recently_updated':
                return { createdAt: 'desc' };
            default:
                return { createdAt: 'desc' };
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_logs_service_1.ActivityLogsService,
        notifications_service_1.NotificationsService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map