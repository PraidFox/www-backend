import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldEntity } from './entities/field.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldsService {
  constructor(@InjectRepository(FieldEntity) private fieldsRepository: Repository<FieldEntity>) {}

  async getField(fieldId: number) {
    const field = await this.fieldsRepository.findOne({
      where: {
        id: fieldId,
      },
      relations: { options: true },
    });

    if (field) {
      return field;
    } else {
      throw new NotFoundException('Такого поля нет');
    }
  }

  create(createFieldDto: CreateFieldDto) {
    return 'This action adds a new field';
  }

  findAll() {
    return `This action returns all fields`;
  }

  findOne(id: number) {
    return `This action returns a #${id} field`;
  }

  update(id: number, updateFieldDto: UpdateFieldDto) {
    return `This action updates a #${id} field`;
  }

  remove(id: number) {
    return `This action removes a #${id} field`;
  }
}
