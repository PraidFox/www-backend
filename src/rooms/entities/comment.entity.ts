import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';
import { RoomEntity } from './room.entity';

@Entity('comments')
export class CommentEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  text: string;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.comments)
  author: UserEntity;

  @ApiProperty()
  @ManyToOne(() => RoomEntity, (room) => room.comments)
  room: RoomEntity;
}
