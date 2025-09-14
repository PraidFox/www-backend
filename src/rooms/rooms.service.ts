import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';
import { RoomMemberEntity } from './entities/room-user.entity';
import { RoomStatus } from '../utils/constants/constants';
import { UpdateUserReactionDto } from './dto/create-user-reaction.dto';
import { UserLocationEntity } from '../locations/entities/user-location.entity';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomsRepository: Repository<RoomEntity>,
    @InjectRepository(UserRoomReactionEntity)
    private userRoomReactionEntityRepository: Repository<UserRoomReactionEntity>,
    @InjectRepository(RoomLocationEntity)
    private roomLocationRepository: Repository<RoomLocationEntity>,
    private locationService: LocationsService,
  ) {}

  //TODO после реализации гостей, поставить проверку на доступность комнаты
  async getRoom(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: {
        locations: { userLocation: true, generalLocation: true },
        members: { member: true },
        author: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Такой комнаты нет');
    }

    return room;
  }

  //TODO после реализации гостей, поставить проверку на доступность комнаты
  async getRoomFull(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: {
        locations: { userLocation: true, generalLocation: true },
        members: { member: true },
        author: true,
        userReactions: { location: true, user: true },
        comments: { author: true },
      },
    });

    if (!room) {
      throw new NotFoundException('Такой комнаты нет');
    }

    return room;
  }

  /** Проверка доступа пользователя к комнате (автор или участник)*/
  async accessCheck(userId: number, roomId: number) {
    const room: RoomEntity = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: { author: true, members: { member: true } },
    });

    //Проверка есть ли пользовать как автор или в участниках
    return room.members.some((member) => member.member.id === userId) || room.author.id === userId;
  }

  /**Перед созданием комнаты, если есть новые локации создаст их*/
  async createRoom(createRoomDto: CreateRoomDto) {
    let newRoom = await this.buildRoomEntity(createRoomDto, createRoomDto.authorId);
    console.log('newRoom', newRoom);
    try {
      newRoom = await this.roomsRepository.save(newRoom);
    } catch (error) {
      throw new Error('Ошибка при создании новой комнаты: ' + error.message);
    }
    return newRoom;
  }

  async updateRoom(updateRoomDto: UpdateRoomDto, userId: number) {
    await this.getRoom(updateRoomDto.id);

    let room = await this.buildRoomEntity(updateRoomDto, userId);
    room.id = updateRoomDto.id;

    try {
      room = await this.roomsRepository.save(room);
      this.clearNullRoomLinks();
      return room;
    } catch (error) {
      throw new Error(`Ошибка при обновлении комнаты ${updateRoomDto.id}: ` + error.message);
    }
  }

  async deleteRoom(id: number) {
    return this.roomsRepository.delete(id);

    // const room = await this.roomsRepository.findOne({ where: { id } });
    // if (room) {
    //   return this.roomsRepository.remove(room);
    // }
    // throw new Error('Room not found');
  }

  async updateReaction(userReactionDto: UpdateUserReactionDto) {
    await this.userRoomReactionEntityRepository.update(userReactionDto.id, userReactionDto);
  }

  async findUserReaction(userId: number, roomId: number, locationId: number) {
    return await this.userRoomReactionEntityRepository.findOne({
      where: [{ user: { id: userId }, room: { id: roomId }, location: { id: locationId } }],
    });
  }

  async clearNullRoomLinks(): Promise<void> {
    await this.roomLocationRepository.manager.transaction(async (entityManager: EntityManager) => {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from(RoomLocationEntity)
        .where('roomId IS NULL')
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from(RoomMemberEntity)
        .where('roomId IS NULL')
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from(UserRoomReactionEntity)
        .where('roomId IS NULL')
        .execute();
    });
  }

  private async buildRoomEntity(roomDto: CreateRoomDto | UpdateRoomDto, userId: number): Promise<RoomEntity> {
    const roomEntity = this.roomsRepository.create({
      title: roomDto.title,
      exactDate: roomDto.exactDate,
      dateType: roomDto.dateType,
      description: roomDto.description,
      whenRoomClose: roomDto.whenRoomClose,
      whenRoomDeleted: roomDto.whenRoomDeleted,
    });

    if (roomDto instanceof CreateRoomDto) {
      //roomEntity.author = { id: roomDto.authorId }; !!!!!!!!!!!!
    }

    //TODO отказаться от каскадного создания?
    await this.processMembers(roomEntity, roomDto);
    await this.processLocations(roomEntity, roomDto, userId);
    await this.processReactions(roomEntity, roomDto);

    if (roomDto instanceof CreateRoomDto) {
      roomEntity.roomStatus = RoomStatus.CREATED;
    }

    return roomEntity;
  }

  private async processMembers(roomEntity: RoomEntity, roomDto: CreateRoomDto | UpdateRoomDto) {
    if (roomDto instanceof CreateRoomDto) {
      roomEntity.members = roomDto.membersId.map(
        (memberId) =>
          ({
            member: { id: memberId },
          }) as RoomMemberEntity,
      );
    }
    if (roomDto instanceof UpdateRoomDto) {
      roomEntity.members = roomDto.members.map(
        (member) =>
          ({
            id: member.linkId,
            member: { id: member.memberId },
          }) as RoomMemberEntity,
      );
    }
  }

  private async processLocations(
    roomEntity: RoomEntity,
    roomDto: CreateRoomDto | UpdateRoomDto,
    userId: number,
  ) {
    const locations: RoomLocationEntity[] = [];

    if (roomDto.existingLocationsAndDetails) {
      locations.push(
        ...roomDto.existingLocationsAndDetails.map(
          (location) =>
            ({
              id: location.linkId == 0 ? undefined : location.linkId,
              userLocation: location.type == 'user location' && { id: location.existingLocationsId },
              generalLocation: location.type == 'general' && { id: location.existingLocationsId },
              description: location.description,
              exactDate: location.exactDate,
            }) as RoomLocationEntity,
        ),
      );
    }

    if (roomDto.newLocationsAndDetails) {
      roomDto.newLocationsAndDetails.forEach((location) => {
        this.locationService.newLocation(location.newLocation);
      });

      locations.push(
        ...roomDto.newLocationsAndDetails.map(
          (location) =>
            ({
              userLocation: {
                name: location.newLocation.name,
                url: location.newLocation.url,
                address: location.newLocation.address,
                user: { id: userId },
              } as UserLocationEntity,
              description: location.description,
              exactDate: location.exactDate,
            }) as RoomLocationEntity,
        ),
      );
    }

    if (locations.length > 0) {
      roomEntity.locations = locations;
    }
  }

  private async processReactions(roomEntity: RoomEntity, roomDto: CreateRoomDto | UpdateRoomDto) {
    const userReactions: UserRoomReactionEntity[] = [];

    if (roomDto instanceof UpdateRoomDto) {
      for (const location of roomEntity.locations) {
        for (const member of roomEntity.members) {
          const reaction = await this.findUserReaction(
            member.member.id,
            roomDto.id,
            location.userLocation.id,
          );
          if (reaction) {
            userReactions.push(reaction);
          } else {
            userReactions.push({
              user: { id: member.member.id },
              location: location.userLocation,
            } as UserRoomReactionEntity);
          }
        }
      }
    } else {
      for (const location of roomEntity.locations) {
        for (const member of roomEntity.members) {
          userReactions.push({
            user: { id: member.member.id },
            location: location.userLocation,
          } as UserRoomReactionEntity);
        }
      }
    }

    roomEntity.userReactions = userReactions;
  }
}
