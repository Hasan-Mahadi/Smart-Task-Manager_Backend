import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: {
        action: string;
        userId: string;
        projectId?: string;
        taskId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        action: string;
        taskId: string | null;
    }>;
    findRecent(limit?: number, projectId?: string): Promise<({
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
        project: {
            id: string;
            name: string;
        } | null;
        task: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        action: string;
        taskId: string | null;
    })[]>;
}
