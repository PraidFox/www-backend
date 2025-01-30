import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FieldEntity } from './field.entity';

@Entity('options')
export class OptionEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  value: string;

  @ApiProperty()
  @ManyToOne(() => FieldEntity, (option) => option.id)
  field: FieldEntity;
}
