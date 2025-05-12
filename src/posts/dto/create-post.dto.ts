import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
    @ApiProperty({
        description:'title',
        type: String,
        example: 'House of dragon'
    })
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @ApiProperty({
        description:'content',
        type: Object,
        example: 'group of pictures'
    })
    @IsNotEmpty()
    content: any;
    
    @ApiProperty({
        description:'author',
        type: Object,
        example: 'Name Sn. Ln.'
    })
    @IsNotEmpty()
    author: any;
}
