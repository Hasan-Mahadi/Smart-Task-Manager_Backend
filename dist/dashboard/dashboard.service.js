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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/enums/role.enum");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(user) {
        const now = new Date();
        const projectWhere = user.role === role_enum_1.Role.ADMIN
            ? {}
            : {
                OR: [
                    { createdById: user.id },
                    { members: { some: { userId: user.id } } },
                ],
            };
        const taskWhere = user.role === role_enum_1.Role.TEAM_MEMBER
            ? { assignedToId: user.id }
            : user.role === role_enum_1.Role.ADMIN
                ? {}
                : {
                    project: {
                        OR: [
                            { createdById: user.id },
                            { members: { some: { userId: user.id } } },
                        ],
                    },
                };
        const [projects, tasks, activities, notifications] = await Promise.all([
            this.prisma.project.findMany({ where: projectWhere }),
            this.prisma.task.findMany({
                where: taskWhere,
                include: {
                    assignedTo: { select: { id: true, name: true } },
                    project: { select: { id: true, name: true } },
                },
            }),
            this.prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                    project: { select: { id: true, name: true } },
                    task: { select: { id: true, title: true } },
                },
            }),
            this.prisma.notification.findMany({
                where: { userId: user.id, isRead: false },
                take: 5,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
        const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
        const overdueTasks = pendingTasks.filter((t) => t.dueDate && t.dueDate < now);
        const tasksByPriority = [
            { name: 'High', value: tasks.filter((t) => t.priority === 'HIGH').length },
            { name: 'Medium', value: tasks.filter((t) => t.priority === 'MEDIUM').length },
            { name: 'Low', value: tasks.filter((t) => t.priority === 'LOW').length },
        ];
        const taskStatusDistribution = [
            { name: 'Todo', value: tasks.filter((t) => t.status === 'TODO').length },
            { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
            { name: 'Completed', value: completedTasks.length },
        ];
        const projectProgressTrend = await this.getProjectProgressTrend(projectWhere);
        const teamProductivity = await this.getTeamProductivity(taskWhere);
        const upcomingDeadlines = tasks
            .filter((t) => t.dueDate && t.dueDate >= now && t.status !== 'COMPLETED')
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 5);
        const highPriorityTasks = tasks
            .filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED')
            .slice(0, 5);
        const memberWorkload = await this.getMemberWorkload(user);
        return {
            kpis: {
                totalProjects: projects.length,
                totalTasks: tasks.length,
                completedTasks: completedTasks.length,
                pendingTasks: pendingTasks.length,
                overdueTasks: overdueTasks.length,
            },
            charts: {
                tasksByPriority,
                projectProgressTrend,
                teamProductivity,
                taskStatusDistribution,
            },
            widgets: {
                recentActivities: activities,
                upcomingDeadlines,
                highPriorityTasks,
                memberWorkload,
                notifications,
            },
        };
    }
    async getProjectProgressTrend(projectWhere) {
        const projects = await this.prisma.project.findMany({
            where: projectWhere,
            include: { tasks: true },
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map((month, i) => {
            const relevant = projects.filter((p) => {
                const m = p.createdAt.getMonth();
                return m <= i;
            });
            const total = relevant.reduce((sum, p) => sum + p.tasks.length, 0);
            const completed = relevant.reduce((sum, p) => sum + p.tasks.filter((t) => t.status === 'COMPLETED').length, 0);
            return {
                month,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            };
        });
    }
    async getTeamProductivity(taskWhere) {
        const tasks = await this.prisma.task.findMany({
            where: taskWhere,
            orderBy: { updatedAt: 'asc' },
        });
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const chunk = Math.max(1, Math.ceil(tasks.length / 4));
        return weeks.map((week, i) => ({
            week,
            completed: tasks
                .slice(i * chunk, (i + 1) * chunk)
                .filter((t) => t.status === 'COMPLETED').length,
            created: tasks.slice(i * chunk, (i + 1) * chunk).length,
        }));
    }
    async getMemberWorkload(user) {
        const members = await this.prisma.user.findMany({
            where: user.role === role_enum_1.Role.TEAM_MEMBER
                ? { id: user.id }
                : { role: { in: ['TEAM_MEMBER', 'PROJECT_MANAGER'] } },
            select: {
                id: true,
                name: true,
                avatar: true,
                tasks: {
                    select: { status: true, dueDate: true },
                },
            },
        });
        const now = new Date();
        return members.map((m) => ({
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            totalTasks: m.tasks.length,
            completedTasks: m.tasks.filter((t) => t.status === 'COMPLETED').length,
            pendingTasks: m.tasks.filter((t) => t.status !== 'COMPLETED').length,
            overdueTasks: m.tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== 'COMPLETED').length,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map