import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { UserMinInfo } from '../users/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';
import { RoomMemberEntity } from './entities/room-user.entity';
import { RoomStatus } from '../utils/constants/constants';
import { UpdateUserReactionDto } from './dto/create-user-reaction.dto';

//Может стоит комментарии вынести в отдельный модуль? Или будут жить только в части комнат? Или вообще вынести другие части?
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
    private roomLocationRepository: Repository<RoomLocationEntity>,
    @InjectRepository(RoomMemberEntity)
    private userRoomRepository: Repository<RoomMemberEntity>,

    //private readonly locationsService: LocationsService,
  ) {}

  async getRoom(id: number) {
    //TODO узнать как ограничить возвращаемые данные в author и member. UPD походу только ручной труд
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: { locations: { location: true }, members: { member: true }, author: true },
    });
    if (room) {
      //
      return room;
    } else {
      throw new NotFoundException('Такой комнаты нет');
    }
  }

  async getRoomFull(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: {
        locations: { location: true },
        members: { member: true },
        author: true,
        userReactions: { location: true, user: true },
        comments: { author: true },
      },
    });
    if (room) {
      //const membersWithStatus = room.members.map((roomUser) => ({
      //   user: roomUser.member, // здесь берем данные о пользователе
      //   status: roomUser.status, // и статус
      // }));

      return room;
    } else {
      throw new NotFoundException('Такой комнаты нет');
    }
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
    let newRoom = await this.buildRoomEntity(createRoomDto);
    console.log('newRoom', newRoom);
    try {
      newRoom = await this.roomsRepository.save(newRoom);
    } catch (error) {
      throw new Error('Ошибка при создании новой комнаты: ' + error.message);
    }
    return newRoom;
  }

  async updateRoom(updateRoomDto: UpdateRoomDto) {
    await this.getRoom(updateRoomDto.id);

    let room = await this.buildRoomEntity(updateRoomDto);
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

  async createComment(commentDto: CreateCommentDto) {
    await this.commentRepository.save({
      text: commentDto.text,
      author: { id: commentDto.authorId } as UserMinInfo,
      room: { id: commentDto.roomId } as RoomEntity,
    });
  }

  async updateComment(commentDto: UpdateCommentDto) {
    await this.commentRepository.update(commentDto.id, commentDto);
  }

  async deleteComment(commentId: number) {
    await this.commentRepository.delete(commentId);
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

  private async buildRoomEntity(roomDto: CreateRoomDto | UpdateRoomDto): Promise<RoomEntity> {
    const roomEntity = this.roomsRepository.create({
      title: roomDto.title,
      exactDate: roomDto.exactDate,
      dateType: roomDto.dateType,
      description: roomDto.description,
      whenRoomClose: roomDto.whenRoomClose,
      whenRoomDeleted: roomDto.whenRoomDeleted,
    });

    if (roomDto instanceof CreateRoomDto) {
      roomEntity.author = { id: roomDto.authorId } as UserMinInfo;
    }

    await this.processMembers(roomEntity, roomDto);
    await this.processLocations(roomEntity, roomDto);
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

  private async processLocations(roomEntity: RoomEntity, roomDto: CreateRoomDto | UpdateRoomDto) {
    const locations: RoomLocationEntity[] = [];

    if (roomDto.existingLocationsAndDetails) {
      locations.push(
        ...roomDto.existingLocationsAndDetails.map(
          (location) =>
            ({
              id: location.linkId == 0 ? undefined : location.linkId,
              location: { id: location.existingLocationsId },
              description: location.description,
              exactDate: location.exactDate,
            }) as RoomLocationEntity,
        ),
      );
    }

    if (roomDto.newLocationsAndDetails) {
      locations.push(
        ...roomDto.newLocationsAndDetails.map(
          (location) =>
            ({
              location: location.newLocation,
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
          const reaction = await this.findUserReaction(member.member.id, roomDto.id, location.location.id);
          if (reaction) {
            userReactions.push(reaction);
          } else {
            userReactions.push({
              user: { id: member.member.id } as UserMinInfo,
              location: location.location,
            } as UserRoomReactionEntity);
          }
        }
      }
    } else {
      for (const location of roomEntity.locations) {
        for (const member of roomEntity.members) {
          userReactions.push({
            user: { id: member.member.id } as UserMinInfo,
            location: location.location,
          } as UserRoomReactionEntity);
        }
      }
    }

    roomEntity.userReactions = userReactions;
  }
}
