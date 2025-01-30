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
  @Column({ nullable: true })
  startDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  endDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  exactDate: Date;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.roomsIsAuthor)
  author: UserMinInfo;

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
