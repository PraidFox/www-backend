import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomEntity } from './room.entity';
import { UserLocationEntity } from '../../locations/entities/user-location.entity';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralLocationEntity } from '../../locations/entities/general-location.entity';

@Entity('room_location')
export class RoomLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomEntity, (room) => room.locations, { onDelete: 'CASCADE' })
  room: RoomEntity;

  @ManyToOne(() => UserLocationEntity, { cascade: true })
  userLocation: UserLocationEntity;

  @ManyToOne(() => GeneralLocationEntity, { cascade: true })
  generalLocation: UserLocationEntity;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: true })
  exactDate: Date;

  @Column()
  @Column({ nullable: true })
  description: string;
}
