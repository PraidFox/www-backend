import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityMinimal } from '../../utils/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserSessionEntity } from '../../auth/entities/user-session.entity';
import { RoomEntity } from '../../rooms/entities/room.entity';
import { CommentEntity } from '../../rooms/entities/comment.entity';
import { UserRoomReactionEntity } from '../../rooms/entities/room-user-reaction.entity';
import { RoomMemberEntity } from '../../rooms/entities/room-user.entity';
import { UserLocationEntity } from '../../locations/entities/user-location.entity';
import { FriendEntity } from './friend.entity';

@Entity('users')
export class UserEntity extends BaseEntityMinimal {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  login: string;

  @ApiProperty()
  @Column({ unique: true, select: false })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ select: false, nullable: true })
  tmpPassword: string;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true, select: false })
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
  @OneToMany(() => FriendEntity, (friend) => friend.user)
  friends: FriendEntity[];

  @ApiProperty()
  @OneToMany(() => UserRoomReactionEntity, (userReaction) => userReaction.user)
  userReactions: UserRoomReactionEntity[];

  @ApiProperty()
  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @ApiProperty()
  @OneToMany(() => UserLocationEntity, (location) => location.user)
  locations: UserLocationEntity[];
}
