import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, TreeRepository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostEntity } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsRepository: TreeRepository<CommentEntity>,
    private dataSource: DataSource,
  ) {}

  async create(
    postId: number,
    authorId: number,
    dto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const postRepo = transactionalEntityManager.getRepository(PostEntity);
      const commentRepo =
        transactionalEntityManager.getRepository(CommentEntity);

      const postExists = await postRepo.exists({ where: { id: postId } });
      if (!postExists) {
        throw new NotFoundException('Post not found');
      }

      const comment = commentRepo.create({
        text: dto.text,
        post: { id: postId },
        author: { id: authorId },
        parent: dto.parentId ? { id: dto.parentId } : null,
        replyToUser: dto.replyToUserId ? { id: dto.replyToUserId } : null,
      });

      return transactionalEntityManager.save(comment);
    });
  }

  async findByPost(postId: number): Promise<CommentEntity[]> {
    const treeRepo = this.dataSource.getTreeRepository(CommentEntity);

    const rootComments = await treeRepo.find({
      where: {
        post: { id: postId },
        parent: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });

    const trees = await Promise.all(
      rootComments.map((root) => treeRepo.findDescendantsTree(root)),
    );

    return trees;
  }

  async update(
    commentId: number,
    authorId: number,
    dto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, author: { id: authorId } },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.text = dto.text;

    return this.commentsRepository.save(comment);
  }

  async remove(commentId: number, authorId: number): Promise<void> {
    const result = await this.commentsRepository.delete({
      id: commentId,
      author: { id: authorId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Comment not found');
    }
  }
}
