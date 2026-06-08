import { ProjectStatus } from '../../common/enums/project-status.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProjectQueryDto extends PaginationDto {
    status?: ProjectStatus;
}
