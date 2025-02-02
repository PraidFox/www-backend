import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldEntity } from './entities/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldsController],
  providers: [FieldsService],
})
export class FieldsModule {}
