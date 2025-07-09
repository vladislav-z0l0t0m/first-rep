import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostReactionEntity } from './entities/post-reaction.entity';
import { PostsReactionsService } from './posts-reactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostReactionEntity])],
  controllers: [PostsController],
  providers: [PostsService, PostsReactionsService],
  exports: [PostsService, PostsReactionsService],
})
export class PostsModule {}
