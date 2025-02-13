import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateLocationDto } from '../../locations/dto/create-location.dto';
import { Transform, Type } from 'class-transformer';
import { DateType, RoomStatus } from '../../utils/constants/constants';

// @ArrayNotEmpty({ message: 'newLocations не должен быть пустым' }) // Проверяет, что массив не пустой

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationAndDetailsDto)
  @IsOptional()
  existingLocationsAndDetails: LocationAndDetailsDto[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewLocationAndDetailsDto)
  newLocationsAndDetails: NewLocationAndDetailsDto[];

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  membersId: number[];

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsOptional()
  exactDate: Date;

  @IsEnum(DateType)
  dateType: DateType;

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @IsOptional()
  whenRoomClose: Date;

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @IsOptional()
  whenRoomDeleted: Date;
}

export class UpdateRoomDto extends OmitType(CreateRoomDto, ['authorId']) {
  //TODO проверить работает ли унаследование
  id: number;
  roomStatus: RoomStatus;
}

class DetailsForWhere {
  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsOptional()
  exactDate: Date;

  @IsString()
  @IsOptional()
  description: string;
}

export class NewLocationAndDetailsDto extends DetailsForWhere {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  newLocation: CreateLocationDto;
}

export class LocationAndDetailsDto extends DetailsForWhere {
  @ApiProperty()
  @IsNumber()
  existingLocationsId: number;
}

//TODO завести декоратор, который будет проверять что бы startDate/endDate или exactDate были заполнены
// import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
//
// export function IsAtLeastOneDateSet(validationOptions?: ValidationOptions) {
//   return function(object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'isAtLeastOneDateSet',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           const object = args.object as any;
//           return Boolean(object.startDate || object.endDate || object.exactDate);
//         },
//         defaultMessage(args: ValidationArguments) {
//           return 'Должна быть указана хотя бы одна дата (startDate, endDate или exactDate)';
//         },
//       },
//     });
//   };
// }
// @IsAtLeastOneDateSet({ message: 'Должна быть указана хотя бы одна дата' })
// datesCheck: string; // Можно использовать любое поле, которое не будет использоваться в вашем DTO
