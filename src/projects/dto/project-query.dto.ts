import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProjectQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
