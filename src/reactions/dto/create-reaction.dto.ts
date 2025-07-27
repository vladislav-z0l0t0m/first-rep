import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReactionType } from '../constants/reaction-type.enum';

export class CreateReactionDto {
  @ApiProperty({ description: 'Reaction type', enum: ReactionType })
  @IsEnum(ReactionType)
  type: ReactionType;
}
