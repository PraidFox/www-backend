import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity, UserMinInfo } from '../../users/entities/user.entity';
import { CommentEntity } from './comment.entity';
import { UserRoomReactionEntity } from './room-user-reaction.entity';
import { RoomLocationEntity } from './room-location.entity';

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
  @OneToMany(() => RoomLocationEntity, (location) => location.room)
  /**Дополнительные поля лежат в room-location (переделать?)**/
  roomLocations: RoomLocationEntity[];

  @ApiProperty()
  @ManyToMany(() => UserEntity, (user) => user.rooms)
  /**Дополнительные поля лежат в room-user (переделать?)**/
  members: UserMinInfo[];

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
  @Column()
  roomStatus: 'создан' | 'процесс пошел' | 'выполняется' | 'закрыта';

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomClose: Date;

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomDeleted: Date;
}
