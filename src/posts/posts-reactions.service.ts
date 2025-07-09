import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { PostEntity } from './entities/post.entity';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { ReactionStatus } from './constants/reaction-status.enum';
import { PostReactionType } from './constants/post-reaction-type.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsReactionsService {
  constructor(
    @InjectRepository(PostReactionEntity)
    private reactionsRepository: Repository<PostReactionEntity>,
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  public async handleReaction(
    postId: number,
    dto: CreatePostReactionDto,
    userId: number,
  ): Promise<ReactionResponseDto> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingReaction = await this.reactionsRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
      relations: ['post', 'user'],
    });

    if (existingReaction) {
      if (existingReaction.reactionType === dto.reactionType) {
        return this.removeReaction(existingReaction);
      } else {
        return this.updateReaction(existingReaction, dto.reactionType);
      }
    }

    return this.createReaction(post, userId, dto.reactionType);
  }

  private async createReaction(
    post: PostEntity,
    userId: number,
    reactionType: PostReactionType,
  ): Promise<ReactionResponseDto> {
    const newReaction = this.reactionsRepository.create({
      post,
      user: { id: userId },
      reactionType,
    });

    const createdReaction = await this.reactionsRepository.save(newReaction);

    const fullReaction = await this.reactionsRepository.findOne({
      where: { id: createdReaction.id },
      relations: ['post', 'user'],
    });

    if (!fullReaction) {
      throw new NotFoundException('Could not retrieve the created reaction.');
    }

    return ReactionResponseDto.fromEntity(ReactionStatus.CREATED, fullReaction);
  }

  private async updateReaction(
    reaction: PostReactionEntity,
    newType: PostReactionType,
  ): Promise<ReactionResponseDto> {
    reaction.reactionType = newType;

    const updatedReaction = await this.reactionsRepository.save(reaction);

    return ReactionResponseDto.fromEntity(
      ReactionStatus.UPDATED,
      updatedReaction,
    );
  }

  private async removeReaction(
    reaction: PostReactionEntity,
  ): Promise<ReactionResponseDto> {
    const response = ReactionResponseDto.fromEntity(
      ReactionStatus.REMOVED,
      reaction,
    );

    await this.reactionsRepository.remove(reaction);

    return response;
  }
}
