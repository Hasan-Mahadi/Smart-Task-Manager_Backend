import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, title: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    findByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
}
