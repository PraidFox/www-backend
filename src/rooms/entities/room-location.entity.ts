import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { LocationEntity } from '../../locations/entities/location.entity';

@Entity('room-location')
export class RoomLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.locations)
  @JoinColumn({ name: 'room', referencedColumnName: 'id' })
  room: RoomEntity;

  @ManyToOne(() => LocationEntity, (location) => location.rooms)
  @JoinColumn({ name: 'location', referencedColumnName: 'id' })
  location: LocationEntity;

  @Column()
  status: string; // точно не могу, возможно, точно буду, думаю
}
