import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  FindManyOptions,
  TreeRepository,
  LessThan,
  Brackets,
} from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { ReactionsService } from '../reactions/reactions.service';
import { ReactableType } from 'src/reactions/constants/reactable-type.enum';
import { CursorPaginatedCommentsResponseDto } from './dto/cursor-paginated-comments.dto';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { PostsService } from 'src/posts/posts.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constants';

interface RepliesCountResult {
  parentId: number;
  count: string;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsRepository: TreeRepository<CommentEntity>,
    private reactionsService: ReactionsService,
    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  async create(
    postId: number,
    authorId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.postsService.ensurePostExists(postId);

    if (dto.parentId) {
      await this.ensureCommentExists(dto.parentId);
    }
    const comment = this.commentsRepository.create({
      text: dto.text,
      post: { id: postId },
      author: { id: authorId },
      parent: dto.parentId ? { id: dto.parentId } : null,
      replyToUser: dto.replyToUserId ? { id: dto.replyToUserId } : null,
    });

    const savedComment = await this.commentsRepository.save(comment);

    return this.findOne(savedComment.id, authorId);
  }

  async findOne(
    commentId: number,
    currentUserId?: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'replyToUser'],
      withDeleted: true,
    });
    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND(commentId));
    }

    const repliesCount = await this.commentsRepository.count({
      where: { parent: { id: commentId } },
    });
    const reactions = await this.reactionsService.findByReactable(
      commentId,
      ReactableType.COMMENT,
    );

    return CommentResponseDto.fromEntity(
      comment,
      reactions,
      repliesCount,
      currentUserId,
    );
  }

  async findPostRootComments(
    postId: number,
    paginationDto: CursorPaginationDto,
    currentUserId?: number,
  ): Promise<CursorPaginatedCommentsResponseDto> {
    const { cursor, limit = 10 } = paginationDto;

    const findOptions: FindManyOptions<CommentEntity> = {
      where: { post: { id: postId }, parent: IsNull() },
      order: { createdAt: 'DESC' },
      take: limit + 1,
      relations: ['author', 'replyToUser'],
    };

    if (cursor) {
      findOptions.where = {
        ...findOptions.where,
        createdAt: LessThan(new Date(cursor)),
      };
    }

    const rootComments = await this.commentsRepository.find(findOptions);
    const hasMore = rootComments.length > limit;
    if (hasMore) rootComments.pop();

    const commentDtos = await this.assembleCommentResponseDtos(
      rootComments,
      currentUserId,
    );
    const nextCursor = hasMore
      ? rootComments[rootComments.length - 1].createdAt.toISOString()
      : null;

    return { comments: commentDtos, nextCursor };
  }

  async findRepliesForComment(
    parentId: number,
    paginationDto: CursorPaginationDto,
    currentUserId?: number,
  ): Promise<CursorPaginatedCommentsResponseDto> {
    const { cursor, limit = 10 } = paginationDto;

    const parentComment = await this.commentsRepository.findOneBy({
      id: parentId,
    });
    if (!parentComment) {
      throw new NotFoundException(
        ERROR_MESSAGES.PARENT_COMMENT_NOT_FOUND(parentId),
      );
    }

    const descendants =
      await this.commentsRepository.findDescendants(parentComment);
    const descendantIds = descendants.map((desc) => desc.id);

    if (descendantIds.length === 0) {
      return { comments: [], nextCursor: null };
    }

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replyToUser', 'replyToUser')
      .where('comment.id IN (:...descendantIds)', { descendantIds })
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('comment.id', 'ASC');

    if (cursor) {
      try {
        const { createdAt, id } = this.decodeCursor(cursor);
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('comment.createdAt > :createdAt', { createdAt }).orWhere(
              new Brackets((qb2) => {
                qb2
                  .where('comment.createdAt = :createdAt', { createdAt })
                  .andWhere('comment.id > :id', { id });
              }),
            );
          }),
        );
      } catch {
        return { comments: [], nextCursor: null };
      }
    }

    queryBuilder.take(limit + 1);

    const allReplies = await queryBuilder.getMany();
    const hasMore = allReplies.length > limit;

    const replies = hasMore ? allReplies.slice(0, limit) : allReplies;

    const commentDtos = await this.assembleCommentResponseDtos(
      replies,
      currentUserId,
    );

    const nextCursor =
      hasMore && allReplies[limit]
        ? this.encodeCursor(allReplies[limit])
        : null;

    return { comments: commentDtos, nextCursor };
  }

  async update(
    commentId: number,
    authorId: number,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND(commentId));
    }
    if (comment.author.id !== authorId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_AUTHOR_FORBIDDEN);
    }

    comment.text = dto.text;
    await this.commentsRepository.save(comment);

    return this.findOne(commentId, authorId);
  }

  async remove(commentId: number, authorId: number): Promise<void> {
    const commentToRemove = await this.commentsRepository.findOne({
      where: { id: commentId, author: { id: authorId } },
      relations: ['parent', 'author'],
    });
    if (!commentToRemove) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND(commentId));
    }
    if (commentToRemove.author.id !== authorId) {
      throw new ForbiddenException(ERROR_MESSAGES.NOT_AUTHOR_FORBIDDEN);
    }

    if (commentToRemove.parent === null) {
      const descendants =
        await this.commentsRepository.findDescendants(commentToRemove);
      await this.commentsRepository.remove(descendants);
    } else {
      await this.commentsRepository.softDelete({ id: commentId });
    }
  }

  async ensureCommentExists(commentId: number): Promise<void> {
    const exists = await this.commentsRepository.exists({
      where: { id: commentId },
    });
    if (!exists) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT_NOT_FOUND(commentId));
    }
  }

  async countByPostId(postId: number): Promise<number> {
    return this.commentsRepository.count({
      where: { post: { id: postId } },
    });
  }

  async countByPostIds(postIds: number[]): Promise<Map<number, number>> {
    if (postIds.length === 0) {
      return new Map();
    }

    const result = await this.commentsRepository
      .createQueryBuilder('comment')
      .select('comment.postId', 'postId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.postId IN (:...postIds)', { postIds })
      .groupBy('comment.postId')
      .getRawMany();

    return new Map(
      result.map((item: { postId: number; count: string }) => [
        item.postId,
        parseInt(item.count, 10),
      ]),
    );
  }

  private async assembleCommentResponseDtos(
    comments: CommentEntity[],
    currentUserId?: number,
  ): Promise<CommentResponseDto[]> {
    if (comments.length === 0) return [];

    const commentIds = comments.map((c) => c.id);

    const repliesCounts: RepliesCountResult[] = await this.commentsRepository
      .createQueryBuilder('reply')
      .select('reply.parentId', 'parentId')
      .addSelect('COUNT(reply.id)', 'count')
      .where('reply.parentId IN (:...commentIds)', { commentIds })
      .groupBy('reply.parentId')
      .getRawMany();
    const repliesCountMap = new Map(
      repliesCounts.map((i) => [i.parentId, parseInt(i.count, 10)]),
    );

    const reactions = await this.reactionsService.findForMany(
      commentIds,
      ReactableType.COMMENT,
    );
    const reactionsMap = this.reactionsService.groupReactionsById(reactions);

    return comments.map((comment) =>
      CommentResponseDto.fromEntity(
        comment,
        reactionsMap.get(comment.id) || [],
        currentUserId,
        repliesCountMap.get(comment.id) || 0,
      ),
    );
  }

  private encodeCursor(entity: CommentEntity): string {
    const data = `${entity.createdAt.toISOString()}_${entity.id}`;
    return Buffer.from(data).toString('base64');
  }

  private decodeCursor(cursor: string): { createdAt: Date; id: number } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('ascii');
      const [dateString, idString] = decoded.split('_');

      if (!dateString || !idString) {
        throw new Error('Invalid cursor format');
      }

      const createdAt = new Date(dateString);
      const id = parseInt(idString, 10);

      if (isNaN(createdAt.getTime()) || isNaN(id)) {
        throw new Error('Invalid cursor data');
      }

      return { createdAt, id };
    } catch {
      throw new Error('Invalid cursor');
    }
  }
}
