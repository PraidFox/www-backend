import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { RoomLocationUserReaction } from '../../utils/constants/constants';

export class CreateUserReactionDto {
  @ApiProperty()
  roomId: number;

  @ApiProperty()
  locationId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  @IsEnum(RoomLocationUserReaction)
  reaction: RoomLocationUserReaction;
}

export class UpdateUserReactionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsEnum(RoomLocationUserReaction)
  reaction: RoomLocationUserReaction;
}
