import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto, user: any): Promise<{
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
    findAll(query: ProjectQueryDto, user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, dto: UpdateProjectDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    addMember(id: string, dto: AddMemberDto, user: any): Promise<{
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
    removeMember(id: string, userId: string, user: any): Promise<{
        message: string;
    }>;
}
