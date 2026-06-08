import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TasksService {
    private prisma;
    private activityLogs;
    private notifications;
    constructor(prisma: PrismaService, activityLogs: ActivityLogsService, notifications: NotificationsService);
    create(dto: CreateTaskDto, userId: string, userRole: string): Promise<{
        createdBy: {
            id: string;
            name: string;
        };
        project: {
            id: string;
            name: string;
        };
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
    }>;
    findAll(query: TaskQueryDto, user: {
        id: string;
        role: string;
    }): Promise<{
        data: ({
            createdBy: {
                id: string;
                name: string;
            };
            project: {
                id: string;
                name: string;
            };
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
        comments: ({
            user: {
                id: string;
                name: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            taskId: string;
            content: string;
        })[];
        createdBy: {
            id: string;
            name: string;
        };
        project: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
            avatar: string | null;
        } | null;
        attachments: {
            id: string;
            createdAt: Date;
            taskId: string;
            fileUrl: string;
            fileName: string | null;
        }[];
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
    }>;
    update(id: string, dto: UpdateTaskDto, user: {
        id: string;
        role: string;
    }): Promise<{
        createdBy: {
            id: string;
            name: string;
        };
        project: {
            id: string;
            name: string;
        };
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
    }>;
    remove(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        message: string;
    }>;
    private checkDuplicateTitle;
    private notifyAssignment;
    private ensureTaskAccess;
    private buildWhere;
    private getOrderBy;
    private taskInclude;
}
