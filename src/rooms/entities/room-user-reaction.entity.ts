import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity, UserMinInfo } from '../../users/entities/user.entity';
import { RoomEntity } from './room.entity';
import { LocationEntity } from '../../locations/entities/location.entity';

@Entity('room_user_reactions')
export class UserRoomReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.userReactions)
  user: UserMinInfo;

  @ManyToOne(() => RoomEntity, (room) => room.userReactions)
  room: RoomEntity;

  @ManyToOne(() => LocationEntity)
  location: LocationEntity;

  @Column()
  reaction: string; // или любые другие значения, отражающие реакцию
}
