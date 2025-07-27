import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post text',
    type: String,
    example: 'Some post text',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Location',
    type: String,
    required: false,
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Is post hidden',
    type: Boolean,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;

  @ApiProperty({
    description: 'Image URLs',
    type: [String],
    example: ['https://minio/image1.jpg'],
  })
  @IsArray()
  @IsNotEmpty()
  imageUrls: string[];

  @ApiProperty({
    description: 'Hashtags',
    type: [String],
    required: false,
    example: ['#tag1', '#tag2'],
  })
  @IsArray()
  @IsOptional()
  hashtags?: string[];
}
