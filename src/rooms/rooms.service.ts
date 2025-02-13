import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { UserMinInfo } from '../users/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { CreateLocationReactionDto } from './dto/create-location-reaction.dto';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';
import { RoomMemberEntity } from './entities/room-user';
import { RoomLocationUserReaction, RoomStatus } from '../utils/constants/constants';
import { LocationEntity } from '../locations/entities/location.entity';

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
        locations: true,
        members: { member: true },
        author: true,
        userReactions: true,
        comments: true,
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
    try {
      console.log('newRoom', newRoom);
      newRoom = await this.roomsRepository.save(newRoom);
    } catch (error) {
      throw new Error('Ошибка при создания новой комнаты: ' + error.message);
    }

    newRoom.locations.forEach((location) => {
      newRoom.members.forEach((member) => {
        this.createReaction({
          roomId: newRoom.id,
          userId: member.id,
          locationId: location.id,
          reaction: RoomLocationUserReaction.NOT_REACTION,
        });
      });
    });

    return newRoom;
  }

  async updateRoom(updateRoomDto: UpdateRoomDto) {
    await this.getRoom(updateRoomDto.id);

    let room = await this.buildRoomEntity(updateRoomDto);
    room.id = updateRoomDto.id;

    try {
      room = await this.roomsRepository.save(room);
      room.locations.forEach((location) => {
        //TODO поиск локации пользователя если есть ничего не делаем, если нет создаём и видимо очищаем то что стало нул? хотя оно же само не станет нулом
      });

      this.clearNullRoomLinks();
      return room;
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
      reaction: RoomLocationUserReaction.NOT_REACTION,
    });

    await this.userRoomReactionEntityRepository.save(reaction);
  }

  // async updateReaction(locationReactionDto: UpdateLocationReactionDto) {
  //   await this.userRoomReactionEntityRepository.update(locationReactionDto.id, locationReactionDto);
  // }

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

      // await entityManager
      //   .createQueryBuilder()
      //   .delete()
      //   .from(UserRoomReactionEntity)
      //   .where('roomId IS NULL')
      //   .execute();
    });
  }

  private async buildRoomEntity(roomDto: CreateRoomDto | UpdateRoomDto) {
    const newRoom = this.roomsRepository.create({
      title: roomDto.title,
      exactDate: roomDto.exactDate,
      dateType: roomDto.dateType,
      description: roomDto.description,
      whenRoomClose: roomDto.whenRoomClose,
      whenRoomDeleted: roomDto.whenRoomDeleted,
    });

    if (roomDto instanceof CreateRoomDto) {
      newRoom.members = roomDto.membersId.map(
        (memberId) =>
          ({
            member: { id: memberId },
          }) as RoomMemberEntity,
      );
    }

    if (roomDto instanceof UpdateRoomDto) {
      newRoom.members = roomDto.members.map(
        (member) =>
          ({
            id: member.linkId,
            member: { id: member.memberId },
          }) as RoomMemberEntity,
      );
    }

    if (roomDto instanceof CreateRoomDto) {
      newRoom.author = { id: roomDto.authorId } as UserMinInfo;
    }

    const locations: RoomLocationEntity[] = [];

    if (roomDto.existingLocationsAndDetails) {
      locations.push(
        ...roomDto.existingLocationsAndDetails.map(
          (location) =>
            ({
              id: location.linkId,
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
      newRoom.locations = locations;
    }

    if (roomDto instanceof CreateRoomDto) {
      newRoom.roomStatus = RoomStatus.CREATED;
    }

    return newRoom;
  }
}
