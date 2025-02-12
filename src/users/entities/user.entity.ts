import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../utils/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';
import { RoomEntity } from '../../rooms/entities/room.entity';
import { CommentEntity } from '../../rooms/entities/comment.entity';
import { UserRoomReactionEntity } from '../../rooms/entities/room-user-reaction.entity';
import { RoomMemberEntity } from '../../rooms/entities/room-user';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  login: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ select: false, nullable: true })
  tmpPassword: string;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt: Date;

  @ApiProperty()
  @OneToMany(() => UserSessionEntity, (session) => session.user)
  sessions: UserSessionEntity[];

  @ApiProperty()
  @OneToMany(() => RoomEntity, (room) => room.author)
  roomsIsAuthor: RoomEntity[];

  @ApiProperty()
  @OneToMany(() => RoomMemberEntity, (roomUser) => roomUser.member)
  rooms: RoomMemberEntity[];

  @ApiProperty()
  @OneToMany(() => UserRoomReactionEntity, (userReaction) => userReaction.user)
  userReactions: UserRoomReactionEntity[];

  @ApiProperty()
  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];
}

export interface UserNotPassword extends Omit<UserEntity, 'password' | 'tmpPassword'> {}

export interface UserMinInfo extends Pick<UserEntity, 'id' | 'login'> {}
