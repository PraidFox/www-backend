import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { MemberStatus } from '../../utils/constants/constants';

@Entity('room-user')
export class RoomMemberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  member: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.members)
  room: RoomEntity;

  @Column({ type: 'enum', enum: MemberStatus })
  status: MemberStatus;

  //Todo добавить толи ролевую модель, то ли что участник (не автор) может делать в комнате
}
