import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRoomService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getMyRoomsIsAuthor(userId: number) {
    const userAndRoom = await this.usersRepository.findOne({
      where: [{ id: userId }],
      relations: { roomsIsAuthor: true },
    });

    return userAndRoom.roomsIsAuthor;
  }

  async getMyRoomsIsMember(userId: number) {
    return await this.usersRepository.findOne({
      where: [{ id: userId }],
      relations: { rooms: true },
    });
  }
}
