import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    getSummary(id: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
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
}
