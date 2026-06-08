import { ProjectStatus } from '../../common/enums/project-status.enum';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    deadline?: string;
    status?: ProjectStatus;
}
