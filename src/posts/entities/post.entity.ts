import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('jsonb') 
    content: Record<string, any>; 

    //TODO delete this field or implement logic(draft post => createdAt != publishDate)
    @Column({ type: 'timestamp' })
    publishDate: Date;

    //TODO add link to the User entity 
    @Column({ type: 'jsonb' })
    author: Record<string, any>;

    @Column()
    likes: number;

    @Column()
    dislikes: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt : Date;
}
