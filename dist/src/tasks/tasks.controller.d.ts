import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, user: any): Promise<{
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
    findAll(query: TaskQueryDto, user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, dto: UpdateTaskDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
