import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity } from './reaction.entity';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionEntity])],
  providers: [ReactionsService],
  controllers: [],
  exports: [ReactionsService],
})
export class ReactionsModule {}
