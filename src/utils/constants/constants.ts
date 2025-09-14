export const CookieName = {
  REFRESH_TOKEN: 'refreshToken',
};

/**Статус участия в комнате*/
export enum MemberStatus {
  NOT_VIEWED = 'не просмотрено',
  VIEWED = 'просмотрено',
  PARTICIPATED = 'поучаствовал в опросе',
}

/**Роль пользователя*/
export enum RoleUserInRoom {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

/**Тип даты для комнат, да бы понимать дата для всех комнаты или для каждой локации своя*/
export enum DateType {
  ALL_LOCATIONS_DATE = 'all_locations_date', // Общая дата для всех локаций
  EACH_LOCATION_DATE = 'each_location_date', // Отдельная дата для каждой локации
}

export enum RoomStatus {
  CREATED = 'created',
  PROGRESS = 'progress',
  RUNNING = 'running',
  CLOSED = 'closed',
}

export enum RoomLocationUserReaction {
  SUCCESS = 'success', //участвует
  FAIL = 'fail', //не участвует
  THIS = 'this', //думает
  NOT_REACTION = 'not_reaction', //еще не проставил
}
