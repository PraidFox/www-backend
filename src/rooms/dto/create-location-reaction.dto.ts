import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationReactionDto {
  @ApiProperty()
  roomId: number;

  @ApiProperty()
  locationId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  reaction: string;
}

export class UpdateLocationReactionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reaction: string;
}
