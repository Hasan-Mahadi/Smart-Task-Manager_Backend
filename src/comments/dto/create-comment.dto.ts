import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsUUID()
  taskId: string;

  @ApiProperty()
  @IsString()
  content: string;
}
