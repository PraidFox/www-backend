import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity, UserMinInfo } from '../../users/entities/user.entity';
import { CommentEntity } from './comment.entity';
import { UserRoomReactionEntity } from './room-user-reaction.entity';
import { RoomLocationEntity } from './room-location.entity';
import { RoomMemberEntity } from './room-user';
import { DateType, RoomStatus } from '../../utils/constants/constants';

@Entity('rooms')
export class RoomEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @OneToMany(() => RoomLocationEntity, (location) => location.room, { cascade: true })
  locations: RoomLocationEntity[];

  @ApiProperty()
  @OneToMany(() => RoomMemberEntity, (roomUser) => roomUser.room, { cascade: true })
  members: RoomMemberEntity[];

  @ApiProperty()
  @Column({ type: 'enum', enum: DateType })
  dateType: DateType;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  exactDate: Date;

  @ApiProperty()
  @OneToMany(() => UserRoomReactionEntity, (userReaction) => userReaction.room)
  userReactions: UserRoomReactionEntity[];

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.roomsIsAuthor)
  author: UserMinInfo; //TODO проверить какой же всё таки объект будет возвращаться UserMinInfo или UserEntity?

  @ApiProperty()
  @OneToMany(() => CommentEntity, (comment) => comment.room)
  comments: CommentEntity[];

  @ApiProperty()
  @Column({ type: 'enum', enum: RoomStatus })
  roomStatus: RoomStatus;

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomClose: Date;

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomDeleted: Date;
}
