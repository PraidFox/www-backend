import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('room-user')
export class RoomsIsMemberUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.members)
  @JoinColumn({ name: 'room', referencedColumnName: 'id' })
  room: RoomEntity;

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  @JoinColumn({ name: 'member', referencedColumnName: 'id' })
  member: UserEntity;

  @Column()
  status: string; //не просмотрено / просмотрено / поучаствовал в опросе

  //Todo добавить толи ролевую модель, то ли что участник (не автор) может делать в комнате
}
