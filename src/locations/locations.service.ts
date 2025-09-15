import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLocationEntity } from './entities/user-location.entity';
import { Repository } from 'typeorm';
import { GeneralLocationEntity } from './entities/general-location.entity';
import { CreateLocationDTO } from './dto/create-location-and-author.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(UserLocationEntity)
    private userLocationsRepository: Repository<UserLocationEntity>,
    @InjectRepository(GeneralLocationEntity)
    private generalLocationsRepository: Repository<GeneralLocationEntity>,
  ) {}

  async create(createLocationDto: UserLocationEntity, userId: number) {
    return await this.userLocationsRepository.save({ ...createLocationDto, user: { id: userId } });
  }

  async createLocationForAllUser(createLocationDto: CreateLocationDTO) {
    return await this.generalLocationsRepository.save(createLocationDto);
  }

  async newLocation(createLocationDto: CreateLocationDTO) {
    const count = await this.countLocationsByName(createLocationDto);
    if (count > 3) {
      return await this.createLocationForAllUser(createLocationDto);
    }
  }

  async countLocationsByName(location: CreateLocationDTO) {
    return await this.userLocationsRepository.count({
      where: {
        name: location.name,
        address: location.address,
      },
    });
  }

  async findAll() {
    return await this.userLocationsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
}
