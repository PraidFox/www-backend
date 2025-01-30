import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserSessionEntity } from './entities/user-session.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSessionEntity)
    private userSessionRepository: Repository<UserSessionEntity>,
    private userService: UsersService,
  ) {}

  /** Проверка соответствия пароля, запись сессии (если больше 5 одну удалим)*/
  async setSession(userId: number, sessionMetadata: string): Promise<UserSessionEntity> {
    const session = await this.userSessionRepository.save({
      user: { id: userId },
      sessionMetadata,
    });

    const [sessions, count] = await this.userSessionRepository.findAndCount({
      where: {
        user: { id: userId },
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    if (count > 5) {
      this.deleteManySessions(sessions.slice(5, count).map((x) => x.id));
    }

    return session;
  }

  // async updateSession(uuidSession: string, refreshToken: string) {
  //   await this.userSessionRepository.update({ id: uuidSession }, { refreshToken });
  // }

  async getSession(uuidSession: string) {
    return await this.userSessionRepository.findOne({
      where: [{ id: uuidSession }],
      //relations: { user: true }, //TODO почему так ругается, но в user.service.ts всё норм?
      //relations: ['user'],
    });
  }

  async deleteSession(uuidSession: string) {
    await this.userSessionRepository.delete({ id: uuidSession });
  }

  async deleteManySessions(uuidSessions: string[]) {
    await this.userSessionRepository.delete({ id: In(uuidSessions) });
  }

  // async getSessionsByUserId(userId: number): Promise<UserSessionEntity[]> {
  //   return await this.userSessionRepository.find({ user: { id: userId } });
  // }
}
