import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { LocationsService } from '../locations/locations.service';
import { LocationEntity } from '../locations/entities/location.entity';
import { UserMinInfo } from '../users/entities/user.entity';
import { CreateLocationDto } from '../locations/dto/create-location.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomsRepository: Repository<RoomEntity>,
    private readonly locationsService: LocationsService,
  ) {}

  async getRoom(id: number) {
    const room = await this.roomsRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException('Такой комнаты нет');
    } else {
      return room;
    }
  }

  /** Проверка доступа пользователя к комнате (автор или участник)*/
  async accessCheck(userId: number, roomId: number) {
    const room: RoomEntity = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: { author: true, members: true },
    });

    //Проверка есть ли пользовать как автор или в участниках
    return room.members.some((member) => member.id === userId) || room.author.id === userId;
  }

  /**Перед созданием комнаты, если есть новые локации создаст их*/
  async createRoom(createRoomDto: CreateRoomDto) {
    //TODO Проверить если не передать newLocations/existingLocationsId ведь должно всё упасть? Или другие необязательные поля (почему TS не подсвечивает?)

    const locationsId = await this.getLocationsId(
      createRoomDto.existingLocationsId,
      createRoomDto.newLocations,
    );

    const newRoom = this.buildRoomEntity(createRoomDto, locationsId);

    try {
      return await this.roomsRepository.save(newRoom);
    } catch (error) {
      throw new Error('Ошибка при сохранении нового помещения: ' + error.message);
    }
  }

  async updateRoom(updateRoomDto: UpdateRoomDto) {
    //TODO проверить всё то же, как поведёт себя с неполными данными?
    await this.getRoom(updateRoomDto.id);

    const locationsId = await this.getLocationsId(
      updateRoomDto.existingLocationsId,
      updateRoomDto.newLocations,
    );

    const room = this.buildRoomEntity(updateRoomDto, locationsId);

    try {
      return await this.roomsRepository.update(updateRoomDto.id, room);
    } catch (error) {
      throw new Error(`Ошибка при обновлении комнаты ${updateRoomDto.id}: ` + error.message);
    }
  }

  /** Проверит нужно ли создание новых локаций, если да, создаст и вернёт их id*/
  private async getLocationsId(existingLocationsId: number[], newLocations: CreateLocationDto[]) {
    const locationsId = [...existingLocationsId];
    if (newLocations.length > 0) {
      const newLocationsId = await this.locationsService.manyCreate(newLocations);
      locationsId.push(...newLocationsId);
    }
    return locationsId;
  }

  private buildRoomEntity(createRoomDto: CreateRoomDto | UpdateRoomDto, locationsId: number[]) {
    const newRoom = this.roomsRepository.create({
      title: createRoomDto.title,
      description: createRoomDto.description,
      startDate: createRoomDto.startDate,
      endDate: createRoomDto.endDate,
      exactDate: createRoomDto.exactDate,
      whenRoomClose: createRoomDto.whenRoomClose,
    });

    newRoom.locations = locationsId.map((id) => ({ id }) as LocationEntity);

    if (createRoomDto instanceof CreateRoomDto) {
      newRoom.author = { id: createRoomDto.authorId } as UserMinInfo;
    }

    newRoom.members = createRoomDto.members.map((id) => ({ id }) as UserMinInfo);

    return newRoom;
  }
}
