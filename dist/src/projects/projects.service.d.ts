import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProjectsService {
    private prisma;
    private activityLogs;
    private notifications;
    constructor(prisma: PrismaService, activityLogs: ActivityLogsService, notifications: NotificationsService);
    create(dto: CreateProjectDto, userId: string): Promise<{
        createdBy: {
            id: string;
            name: string;
            avatar: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            projectId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        deadline: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdById: string;
    }>;
    findAll(query: ProjectQueryDto, user: {
        id: string;
        role: string;
    }): Promise<{
        data: ({
            createdBy: {
                id: string;
                name: string;
                avatar: string | null;
            };
            _count: {
                tasks: number;
                members: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            deadline: Date | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            createdById: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        tasks: ({
            assignedTo: {
                id: string;
                name: string;
                avatar: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            createdById: string;
            title: string;
            dueDate: Date | null;
            priority: import(".prisma/client").$Enums.TaskPriority;
            updatedAt: Date;
            projectId: string;
            assignedToId: string | null;
        })[];
        createdBy: {
            id: string;
            name: string;
            avatar: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            projectId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        deadline: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdById: string;
    }>;
    update(id: string, dto: UpdateProjectDto, user: {
        id: string;
        role: string;
    }): Promise<{
        createdBy: {
            id: string;
            name: string;
            avatar: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            projectId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        deadline: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdById: string;
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        message: string;
    }>;
    addMember(projectId: string, memberUserId: string, user: {
        id: string;
        role: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        userId: string;
        projectId: string;
    }>;
    removeMember(projectId: string, memberUserId: string, user: {
        id: string;
        role: string;
    }): Promise<{
        message: string;
    }>;
    private projectInclude;
    private ensureAccess;
    private getOrderBy;
}
