import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { LocationEntity } from '../../locations/entities/location.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('room_location')
export class RoomLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.roomLocations)
  @JoinColumn({ name: 'room', referencedColumnName: 'id' })
  room: RoomEntity;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'location', referencedColumnName: 'id' })
  location: LocationEntity;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  exactDate: Date;

  @Column()
  description: string;
}
