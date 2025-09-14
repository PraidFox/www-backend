import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_locations')
export class UserLocationEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @IsUrl()
  @Column()
  @Column({ nullable: true })
  url: string;

  @ApiProperty()
  @Column()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @ManyToOne(() => UserEntity, (user) => user.locations)
  user: UserEntity;
}
