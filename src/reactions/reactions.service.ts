import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityTarget, In, Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PostEntity } from '../posts/entities/post.entity';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { ReactionStatus } from './constants/reaction-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionEntity } from './reaction.entity';
import { ReactableType } from './constants/reactable-type.enum';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { ReactionType } from './constants/reaction-type.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constants';

@Injectable()
export class ReactionsService {
  private reactableEntities = new Map<ReactableType, EntityTarget<any>>([
    [ReactableType.POST, PostEntity],
    [ReactableType.COMMENT, CommentEntity],
  ]);

  constructor(
    @InjectRepository(ReactionEntity)
    private reactionsRepository: Repository<ReactionEntity>,
    private dataSource: DataSource,
  ) {}

  public async handleReaction(
    reactableId: number,
    reactableType: ReactableType,
    dto: CreateReactionDto,
    authorId: number,
  ): Promise<ReactionResponseDto> {
    await this.validateReactableExists(reactableType, reactableId);

    const existingReaction = await this.reactionsRepository.findOne({
      where: {
        reactableId,
        reactableType,
        author: { id: authorId },
      },
      relations: ['author'],
    });

    if (existingReaction) {
      if (existingReaction.type === dto.type) {
        return this.removeReaction(existingReaction);
      } else {
        return this.updateReaction(existingReaction, dto.type);
      }
    }

    return this.createReaction(reactableId, reactableType, dto.type, authorId);
  }

  async findByReactable(
    reactableId: number,
    reactableType: ReactableType,
  ): Promise<ReactionEntity[]> {
    return this.reactionsRepository.find({
      where: {
        reactableId,
        reactableType,
      },
      relations: ['author'],
    });
  }

  async findForMany(
    reactableIds: number[],
    reactableType: ReactableType,
  ): Promise<ReactionEntity[]> {
    if (reactableIds.length === 0) {
      return [];
    }

    return this.reactionsRepository.find({
      where: {
        reactableId: In(reactableIds),
        reactableType,
      },
      relations: ['author'],
    });
  }

  groupReactionsById(
    reactions: ReactionEntity[],
  ): Map<number, ReactionEntity[]> {
    return reactions.reduce((map, reaction) => {
      const reactionsForPost = map.get(reaction.reactableId) || [];

      reactionsForPost.push(reaction);

      map.set(reaction.reactableId, reactionsForPost);
      return map;
    }, new Map<number, ReactionEntity[]>());
  }

  private async createReaction(
    reactableId: number,
    reactableType: ReactableType,
    type: ReactionType,
    authorId: number,
  ): Promise<ReactionResponseDto> {
    const newReaction = this.reactionsRepository.create({
      reactableId,
      reactableType,
      type,
      author: { id: authorId },
    });

    const createdReaction = await this.reactionsRepository.save(newReaction);

    return ReactionResponseDto.fromEntity(
      ReactionStatus.CREATED,
      createdReaction,
    );
  }

  private async updateReaction(
    reaction: ReactionEntity,
    newType: ReactionType,
  ): Promise<ReactionResponseDto> {
    reaction.type = newType;

    const updatedReaction = await this.reactionsRepository.save(reaction);

    return ReactionResponseDto.fromEntity(
      ReactionStatus.UPDATED,
      updatedReaction,
    );
  }

  private async removeReaction(
    reaction: ReactionEntity,
  ): Promise<ReactionResponseDto> {
    const response = ReactionResponseDto.fromEntity(
      ReactionStatus.REMOVED,
      reaction,
    );

    await this.reactionsRepository.remove(reaction);

    return response;
  }

  private async validateReactableExists(
    type: ReactableType,
    id: number,
  ): Promise<void> {
    const entityClass = this.reactableEntities.get(type);

    if (!entityClass) {
      throw new NotFoundException(
        ERROR_MESSAGES.REACTABLE_TYPE_NOT_SUPPORTED(type),
      );
    }

    const entityRepository = this.dataSource.getRepository(entityClass);
    const exists = await entityRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(ERROR_MESSAGES.REACTABLE_NOT_FOUND(type, id));
    }
  }
}
