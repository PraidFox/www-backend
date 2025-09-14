import {
  BaseEntity as _BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity extends _BaseEntity {
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ select: false })
  deletedAt: Date;
}

export abstract class BaseEntityMinimal extends _BaseEntity {
  @ApiProperty()
  @CreateDateColumn()
  @Column({ select: false })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  @Column({ select: false })
  updatedAt: Date;

  @ApiProperty()
  @Column({ select: false })
  @DeleteDateColumn({ select: false })
  deletedAt: Date;
}
