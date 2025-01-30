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
import { LocationEntity } from '../../locations/entities/location.entity';
import { CommentEntity } from './comment.entity';

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
  @ManyToMany(() => LocationEntity, (location) => location.rooms)
  locations: LocationEntity[];

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate: Date;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate: Date;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  exactDate: Date;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.roomsIsAuthor)
  author: UserMinInfo; //TODO проверить какой же всё таки объект будет возвращаться UserMinInfo или UserEntity?

  @ApiProperty()
  @ManyToMany(() => UserEntity, (user) => user.rooms)
  members: UserMinInfo[];

  @ApiProperty()
  @OneToMany(() => CommentEntity, (comment) => comment.room)
  comments: CommentEntity[];

  @ApiProperty()
  @Column()
  roomStatus: 'ожидание' | 'процесс пошел' | 'выполняется' | 'закрыта';

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomClose: Date;

  @ApiProperty()
  @Column({ nullable: true })
  whenRoomDeleted: Date;
}
