import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  text: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => PostEntity, { nullable: false, onDelete: 'CASCADE' })
  post: PostEntity;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  replyToUser: User | null;

  @TreeParent()
  parent: CommentEntity | null;

  @TreeChildren()
  children: CommentEntity[];

  @Column({ nullable: true })
  path: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
