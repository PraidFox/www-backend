import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { LocationEntity } from '../../locations/entities/location.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('room_location')
export class RoomLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.locations)
  room: RoomEntity;

  @ManyToOne(() => LocationEntity, { cascade: true })
  location: LocationEntity;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  exactDate: Date;

  @Column()
  @Column({ nullable: true })
  description: string;
}
