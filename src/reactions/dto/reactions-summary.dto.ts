import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '../constants/reaction-type.enum';

interface ReactionData {
  type: ReactionType;
  author: { id: number };
}

export class ReactionsSummaryDto {
  @ApiProperty({
    description: 'Total count for each reaction type',
    example: { like: 15, laugh: 3 },
  })
  counts: Record<ReactionType, number>;

  @ApiProperty({
    description: 'Current user reaction, if present',
    enum: ReactionType,
    nullable: true,
    example: 'like',
  })
  currentUserReaction: ReactionType | null;

  static fromReactions(
    reactions: ReactionData[],
    currentUserId?: number,
  ): ReactionsSummaryDto {
    const summary = new ReactionsSummaryDto();

    summary.counts = Object.fromEntries(
      Object.values(ReactionType).map((type) => [type, 0]),
    ) as Record<ReactionType, number>;

    summary.currentUserReaction = null;

    for (const reaction of reactions) {
      summary.counts[reaction.type]++;

      if (currentUserId && reaction.author.id === currentUserId) {
        summary.currentUserReaction = reaction.type;
      }
    }

    return summary;
  }
}
