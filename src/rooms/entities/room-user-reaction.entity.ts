import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity, UserMinInfo } from '../../users/entities/user.entity';
import { RoomEntity } from './room.entity';
import { LocationEntity } from '../../locations/entities/location.entity';
import { RoomLocationUserReaction } from '../../utils/constants/constants';
import { ApiProperty } from '@nestjs/swagger';

@Entity('room_user_reactions')
export class UserRoomReactionEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.userReactions)
  user: UserMinInfo;

  @ApiProperty()
  @ManyToOne(() => RoomEntity, (room) => room.userReactions)
  room: RoomEntity;

  @ApiProperty()
  @ManyToOne(() => LocationEntity)
  location: LocationEntity;

  @ApiProperty()
  @Column({ type: 'enum', enum: RoomLocationUserReaction, default: RoomLocationUserReaction.NOT_REACTION })
  reaction: RoomLocationUserReaction; // или любые другие значения, отражающие реакцию
}
