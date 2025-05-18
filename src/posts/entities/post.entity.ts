import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('jsonb')
  content: Record<string, any>;

  //TODO delete this field or implement logic(draft post => createdAt != publishDate)
  @CreateDateColumn({ type: 'timestamp' })
  publishDate: Date;

  //TODO add link to the User entity
  @Column({ type: 'jsonb' })
  author: Record<string, any>;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
