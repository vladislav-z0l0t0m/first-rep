import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('jsonb') 
    content: Record<string, any>; 

    @Column({ type: 'timestamp' })
    publishDate: Date;

    //TODO add link to the User entity 
    @Column({ type: 'jsonb' })
    author: Record<string, any>;

    @Column()
    likes: number;

    @Column()
    dislikes: number;
}
