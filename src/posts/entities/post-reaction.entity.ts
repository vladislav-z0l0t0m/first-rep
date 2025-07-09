import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { User } from '../../user/entities/user.entity';
import { PostReactionType } from '../constants/post-reaction-type.enum';

@Entity()
export class PostReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PostEntity, { nullable: false, onDelete: 'CASCADE' })
  post: PostEntity;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: PostReactionType })
  reactionType: PostReactionType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
