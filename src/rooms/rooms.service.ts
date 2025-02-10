import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { LocationsService } from '../locations/locations.service';
import { LocationEntity } from '../locations/entities/location.entity';
import { UserMinInfo } from '../users/entities/user.entity';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { CreateLocationReactionDto, UpdateLocationReactionDto } from './dto/create-location-reaction.dto';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';

//Может стоит комментарии вынести в отдельный модуль? Или будут жить только в части комнат?
@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomsRepository: Repository<RoomEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserRoomReactionEntity)
    private userRoomReactionEntityRepository: Repository<UserRoomReactionEntity>,
    @InjectRepository(RoomLocationEntity)
    private userRoomLocationRepository: Repository<RoomLocationEntity>,
    private readonly locationsService: LocationsService,
  ) {}

  async getRoom(id: number) {
    const room = await this.roomsRepository.findOne({ where: { id } });
    if (room) {
      return room;
    } else {
      throw new NotFoundException('Такой комнаты нет');
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

    let newRoom = this.buildRoomEntity(createRoomDto);

    try {
      newRoom = await this.roomsRepository.save(newRoom);
    } catch (error) {
      throw new Error('Ошибка при сохранении нового помещения: ' + error.message);
    }

    if (createRoomDto.newLocations) {
      //TODO а не перезатрёт ли данные с уже заведёнными локацими?
      for (const location of createRoomDto.newLocations) {
        const newLocation = await this.getLocationId(location);

        await this.userRoomLocationRepository.save({
          room: { id: newRoom.id } as RoomEntity,
          location: { id: newLocation.id } as LocationEntity,
          description: location.description,
          exactDate: location.exactDate,
        });
      }
    }
    return newRoom;
  }

  async updateRoom(updateRoomDto: UpdateRoomDto) {
    //TODO проверить всё то же, как поведёт себя с неполными данными?
    await this.getRoom(updateRoomDto.id);

    const room = this.buildRoomEntity(updateRoomDto);

    if (updateRoomDto.newLocations) {
      //TODO а не перезатрёт ли данные с уже заведёнными локацими?
      for (const location of updateRoomDto.newLocations) {
        const newLocation = await this.getLocationId(location);

        await this.userRoomLocationRepository.save({
          room: { id: updateRoomDto.id } as RoomEntity,
          location: { id: newLocation.id } as LocationEntity,
          description: location.description,
          exactDate: location.exactDate,
        });
      }
    }

    try {
      return await this.roomsRepository.update(updateRoomDto.id, room);
    } catch (error) {
      throw new Error(`Ошибка при обновлении комнаты ${updateRoomDto.id}: ` + error.message);
    }
  }

  deleteRoom(id: number) {
    return this.roomsRepository.delete(id);
  }

  async createComment(commentDto: CreateCommentDto) {
    //Не чекаю существует ли такой объект по id? Настолько верю фронту? Хм...
    await this.commentRepository.save({
      text: commentDto.text,
      author: { id: commentDto.authorId } as UserMinInfo,
      room: { id: commentDto.room } as RoomEntity,
    });
  }

  async updateComment(commentDto: UpdateCommentDto) {
    await this.commentRepository.update(commentDto.id, commentDto);
  }

  async deleteComment(commentId: number) {
    await this.commentRepository.delete(commentId);
  }

  async createReaction(locationReactionDto: CreateLocationReactionDto) {
    const reaction = this.userRoomReactionEntityRepository.create({
      room: { id: locationReactionDto.roomId } as RoomEntity,
      user: { id: locationReactionDto.userId } as UserMinInfo,
      location: { id: locationReactionDto.locationId } as LocationEntity,
      reaction: locationReactionDto.reaction,
    });

    await this.userRoomReactionEntityRepository.save(reaction);
  }

  async updateReaction(locationReactionDto: UpdateLocationReactionDto) {
    await this.userRoomReactionEntityRepository.update(locationReactionDto.id, locationReactionDto);
  }

  /** Проверит нужно ли создание новых локаций, если да, создаст и вернёт их id*/
  private async getLocationId(newLocation: CreateLocationDto) {
    return await this.locationsService.create(newLocation);
  }

  private buildRoomEntity(createRoomDto: CreateRoomDto | UpdateRoomDto) {
    const newRoom = this.roomsRepository.create({
      title: createRoomDto.title,
      description: createRoomDto.description,
      whenRoomClose: createRoomDto.whenRoomClose,
      whenRoomDeleted: createRoomDto.whenRoomDeleted,
      roomLocations: createRoomDto.existingLocations, //Не понятно как сохранит
    });

    if (createRoomDto instanceof CreateRoomDto) {
      newRoom.author = { id: createRoomDto.authorId } as UserMinInfo;
    }

    if (createRoomDto instanceof CreateRoomDto) {
      newRoom.roomStatus = 'создан';
    } else {
      newRoom.roomStatus = createRoomDto.roomStatus;
    }

    newRoom.members = createRoomDto.membersId.map((id) => ({ id }) as UserMinInfo);

    return newRoom;
  }
}
