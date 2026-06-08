import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getMemberSummary(userId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
    }>;
}
