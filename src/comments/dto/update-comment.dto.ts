import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment text', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  text: string;
}
