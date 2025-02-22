import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'А комментарий то какой?' })
  text: string;

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiProperty()
  @IsNumber()
  roomId: number;
}

export interface UpdateCommentDto extends Omit<CreateCommentDto, 'authorId' | 'roomId'> {
  id: number;
}
