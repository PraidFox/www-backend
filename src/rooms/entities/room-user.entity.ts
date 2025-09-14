import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { MemberStatus, RoleUserInRoom } from '../../utils/constants/constants';

@Entity('room_user')
export class RoomMemberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  member: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.members, { onDelete: 'CASCADE' })
  room: RoomEntity;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.NOT_VIEWED })
  status: MemberStatus;

  @Column({ type: 'enum', enum: RoleUserInRoom, default: RoleUserInRoom.USER })
  role: RoleUserInRoom;

  //Todo добавить толи ролевую модель, то ли что участник (не автор) может делать в комнате
}
