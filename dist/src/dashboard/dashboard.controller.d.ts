import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(user: any): Promise<{
        kpis: {
            totalProjects: number;
            totalTasks: number;
            completedTasks: number;
            pendingTasks: number;
            overdueTasks: number;
        };
        charts: {
            tasksByPriority: {
                name: string;
                value: number;
            }[];
            projectProgressTrend: {
                month: string;
                progress: number;
            }[];
            teamProductivity: {
                week: string;
                completed: number;
                created: number;
            }[];
            taskStatusDistribution: {
                name: string;
                value: number;
            }[];
        };
        widgets: {
            recentActivities: ({
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
            })[];
            upcomingDeadlines: ({
                project: {
                    id: string;
                    name: string;
                };
                assignedTo: {
                    id: string;
                    name: string;
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
            highPriorityTasks: ({
                project: {
                    id: string;
                    name: string;
                };
                assignedTo: {
                    id: string;
                    name: string;
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
            memberWorkload: {
                id: string;
                name: string;
                avatar: string | null;
                totalTasks: number;
                completedTasks: number;
                pendingTasks: number;
                overdueTasks: number;
            }[];
            notifications: {
                id: string;
                createdAt: Date;
                userId: string;
                title: string;
                message: string;
                isRead: boolean;
            }[];
        };
    }>;
}
