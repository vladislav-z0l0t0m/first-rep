import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
    @ApiProperty({
        description:'title',
        type: String,
        example: 'House of dragon'
    })
    title: string;
    @ApiProperty({
        description:'content',
        type: Object,
        example: 'group of pictures'
    })
    content: any;
    @ApiProperty({
        description:'author',
        type: Object,
        example: 'Name Sn. Ln.'
    })
    author: any;
}
