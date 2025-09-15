import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { MyError } from '../../utils/constants/errors';

//Проверка авторизован ли пользователь или нет
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // console.log('err', err);
    // console.log('user', user);
    // console.log('info', info);
    if (err) {
      throw new UnauthorizedException(err.message);
    }

    if (info || !user) {
      throw new UnauthorizedException(info.message);
    }

    // !user.uuidSession
    if (!user.id || !user.login) {
      throw new UnauthorizedException(MyError.FAIL_PARSE_TOKEN);
    }

    return user;
  }
}
