import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoomLocationUserReaction } from '../../utils/constants/constants';

export class CreateLocationReactionDto {
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

export class UpdateLocationReactionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reaction: string;
}
