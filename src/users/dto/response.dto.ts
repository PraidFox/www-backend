import { ApiProperty } from '@nestjs/swagger';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';

export class UserMinimalDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;
}

export class UserSessionsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: [Object] })
  sessions: UserSessionEntity[];
}

// export class AllUserDto {
//   @ApiProperty({ type: [UserMinimalDto] })
//   users: 'Всё что угодно';
//   @ApiProperty()
//   count: number;
// }

export class AllUserDto {
  @ApiProperty({ type: [UserMinimalDto] })
  users: UserMinimalDto[];
  @ApiProperty()
  count: number;
}
