import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';
import { RoomEntity } from '../../rooms/entities/room.entity';

@Entity('locations')
export class LocationEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @IsUrl()
  @Column()
  url: string;

  @ApiProperty()
  @Column()
  address: string;

  @ApiProperty()
  @ManyToMany(() => RoomEntity, (room) => room.locations)
  rooms: RoomEntity[];
}
