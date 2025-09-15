import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  CreateRoomDto,
  LocationAndDetailsDto,
  NewLocationAndDetailsDto,
  UpdateRoomDto,
} from './dto/create-room.dto';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';
import { RoomMemberEntity } from './entities/room-user.entity';
import { RoomStatus } from '../utils/constants/constants';
import { UpdateUserReactionDto } from './dto/create-user-reaction.dto';
import { UserLocationEntity } from '../locations/entities/user-location.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomsRepository: Repository<RoomEntity>,
    @InjectRepository(UserRoomReactionEntity)
    private userRoomReactionEntityRepository: Repository<UserRoomReactionEntity>,
    @InjectRepository(RoomLocationEntity)
    private roomLocationRepository: Repository<RoomLocationEntity>,
    @InjectRepository(RoomMemberEntity)
    private roomMemberRepository: Repository<RoomMemberEntity>,
    @InjectRepository(UserLocationEntity)
    private userLocationRepository: Repository<UserLocationEntity>,
    private dataSource: DataSource,
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
  async accessCheck(userId: number, roomId: number): Promise<boolean> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: { author: true, members: { member: true } },
    });

    if (!room) {
      throw new NotFoundException('Комната не найдена');
    }

    return room.members.some((member) => member.member.id === userId) || room.author.id === userId;
  }

  /** Создание новой комнаты */
  async createRoom(createRoomDto: CreateRoomDto, authorId: number) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      try {
        return await this.buildRoomEntity(
          transactionalEntityManager,
          createRoomDto,
          authorId,
          false, // флаг создания
        );
      } catch (error) {
        throw new Error('Ошибка при создании новой комнаты: ' + error.message);
      }
    });
  }

  /** Обновление существующей комнаты */
  async updateRoom(updateRoomDto: UpdateRoomDto, userId: number) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      try {
        // Проверяем права доступа
        const hasAccess = await this.accessCheck(userId, updateRoomDto.id);
        if (!hasAccess) {
          throw new NotFoundException('Нет доступа для редактирования комнаты');
        }

        return await this.buildRoomEntity(
          transactionalEntityManager,
          updateRoomDto,
          userId,
          true, // флаг обновления
        );
      } catch (error) {
        throw new Error(`Ошибка при обновлении комнаты ${updateRoomDto.id}: ` + error.message);
      }
    });
  }

  async deleteRoom(id: number) {
    return this.roomsRepository.delete(id);
  }

  async updateReaction(userReactionDto: UpdateUserReactionDto) {
    await this.userRoomReactionEntityRepository.update(userReactionDto.id, userReactionDto);
  }

  async findUserReaction(userId: number, roomId: number, locationId: number) {
    return await this.userRoomReactionEntityRepository.findOne({
      where: [{ user: { id: userId }, room: { id: roomId }, location: { id: locationId } }],
    });
  }

  private async buildRoomEntity(
    transactionalEntityManager: EntityManager,
    roomDto: CreateRoomDto | UpdateRoomDto,
    authorId: number,
    isUpdate: boolean = false,
  ): Promise<RoomEntity> {
    let roomEntity: RoomEntity;
    let savedRoom: RoomEntity;

    if (isUpdate && 'id' in roomDto) {
      // РЕЖИМ ОБНОВЛЕНИЯ - загружаем существующую комнату
      roomEntity = await transactionalEntityManager.findOne(RoomEntity, {
        where: { id: roomDto.id },
        relations: ['members', 'locations', 'userReactions'],
      });

      if (!roomEntity) {
        throw new NotFoundException('Комната не найдена');
      }

      // Обновляем поля комнаты
      roomEntity.title = roomDto.title;
      roomEntity.exactDate = roomDto.exactDate;
      roomEntity.dateType = roomDto.dateType;
      roomEntity.description = roomDto.description;
      roomEntity.whenRoomClose = roomDto.whenRoomClose;
      roomEntity.whenRoomDeleted = roomDto.whenRoomDeleted;

      savedRoom = await transactionalEntityManager.save(roomEntity);

      // Удаляем старых участников
      await transactionalEntityManager.delete(RoomMemberEntity, { room: { id: savedRoom.id } });
    } else {
      // РЕЖИМ СОЗДАНИЯ - создаем новую комнату
      roomEntity = this.roomsRepository.create({
        title: roomDto.title,
        exactDate: roomDto.exactDate,
        dateType: roomDto.dateType,
        description: roomDto.description,
        whenRoomClose: roomDto.whenRoomClose,
        whenRoomDeleted: roomDto.whenRoomDeleted,
        author: { id: authorId },
        roomStatus: RoomStatus.CREATED,
      });

      savedRoom = await transactionalEntityManager.save(roomEntity);
    }

    // Обрабатываем участников
    savedRoom.members = await this.processMembers(
      transactionalEntityManager,
      savedRoom.id,
      roomDto.membersId,
    );

    // Обрабатываем локации
    if (isUpdate) {
      // Удаляем старые связи с локациями
      await transactionalEntityManager.delete(RoomLocationEntity, { room: { id: savedRoom.id } });
    }

    const allLocationsData = [
      ...(roomDto.newLocationsAndDetails || []),
      ...(roomDto.existingLocationsAndDetails || []),
    ];

    if (allLocationsData.length > 0) {
      savedRoom.locations = await this.processLocations(
        transactionalEntityManager,
        allLocationsData,
        savedRoom.id,
        authorId,
      );
    } else {
      savedRoom.locations = [];
    }

    // Обрабатываем реакции
    if (isUpdate) {
      // Удаляем старые реакции
      await transactionalEntityManager.delete(UserRoomReactionEntity, { room: { id: savedRoom.id } });
    }

    const memberIds = savedRoom.members.map((member) => member.member.id);
    const locationIds = savedRoom.locations
      .filter((location) => location.userLocation?.id)
      .map((location) => location.userLocation.id);

    if (memberIds.length > 0 && locationIds.length > 0) {
      savedRoom.userReactions = await this.processReactions(
        transactionalEntityManager,
        savedRoom.id,
        memberIds,
        locationIds,
      );
    }

    return savedRoom;
  }

  private async processLocations(
    entityManager: EntityManager,
    locationsData: (NewLocationAndDetailsDto | LocationAndDetailsDto)[],
    roomId: number,
    userId: number,
  ): Promise<RoomLocationEntity[]> {
    const savedRoomLocations: RoomLocationEntity[] = [];

    for (const locationData of locationsData) {
      let userLocationId: number;

      if ('newLocation' in locationData) {
        const userLocationEntity = this.userLocationRepository.create({
          name: locationData.newLocation.name,
          address: locationData.newLocation.address,
          url: locationData.newLocation.url,
          user: { id: userId },
        });
        const savedUserLocation = await entityManager.save(userLocationEntity);
        userLocationId = savedUserLocation.id;
      } else {
        userLocationId = locationData.existingLocationsId;
      }

      const roomLocationEntity = this.roomLocationRepository.create({
        room: { id: roomId },
        userLocation: { id: userLocationId },
        exactDate: locationData.exactDate,
        description: locationData.description,
      });

      const savedRoomLocation = await entityManager.save(roomLocationEntity);
      savedRoomLocations.push(savedRoomLocation);
    }

    return savedRoomLocations;
  }

  private async processMembers(entityManager: EntityManager, roomId: number, memberIds: number[]) {
    const memberEntities = memberIds.map((memberId) =>
      this.roomMemberRepository.create({
        room: { id: roomId },
        member: { id: memberId },
      }),
    );

    return entityManager.save(memberEntities);
  }

  private async processReactions(
    entityManager: EntityManager,
    roomId: number,
    memberIds: number[],
    locationIds: number[],
  ): Promise<UserRoomReactionEntity[]> {
    const reactionsToCreate: UserRoomReactionEntity[] = [];

    // Для каждой пары участник-локация создаем реакцию
    for (const memberId of memberIds) {
      for (const locationId of locationIds) {
        reactionsToCreate.push(
          this.userRoomReactionEntityRepository.create({
            user: { id: memberId },
            room: { id: roomId },
            location: { id: locationId },
          }),
        );
      }
    }

    // Сохраняем все реакции одной операцией
    return entityManager.save(reactionsToCreate);
  }
}
