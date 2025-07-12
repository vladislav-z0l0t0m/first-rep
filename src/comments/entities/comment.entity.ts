import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  TreeParent,
  TreeChildren,
  Tree,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity()
@Tree('materialized-path')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  text: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  post: PostEntity;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  replyToUser: User | null;

  @TreeParent()
  parent: CommentEntity | null;

  @TreeChildren()
  children: CommentEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
