import { Injectable } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(commentDto: CreateCommentDto) {
    await this.commentRepository.save({
      text: commentDto.text,
      author: { id: commentDto.authorId },
      room: { id: commentDto.roomId },
    });
  }

  async updateComment(commentDto: UpdateCommentDto) {
    await this.commentRepository.update(commentDto.id, commentDto);
  }

  async deleteComment(commentId: number) {
    await this.commentRepository.delete(commentId);
  }
}
