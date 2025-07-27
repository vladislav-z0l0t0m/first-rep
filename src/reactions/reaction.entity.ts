import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ReactionType } from './constants/reaction-type.enum';
import { ReactableType } from './constants/reactable-type.enum';

@Entity('reactions')
@Unique(['author', 'reactableId', 'reactableType'])
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'enum', enum: ReactionType })
  type: ReactionType;

  @Column({ type: 'int' })
  reactableId: number;

  @Column({ type: 'enum', enum: ReactableType })
  reactableType: ReactableType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
