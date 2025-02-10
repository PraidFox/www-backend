import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationEntity } from './entities/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationEntity)
    private locationsRepository: Repository<LocationEntity>,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    return await this.locationsRepository.save(createLocationDto);
  }

  async findAll() {
    return await this.locationsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
