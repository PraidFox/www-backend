import { ApiProperty } from '@nestjs/swagger';
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
import { CreateLocationDTO } from '../../locations/dto/create-location-and-author.dto';
import { Transform, Type } from 'class-transformer';
import { DateType } from '../../utils/constants/constants';

// @ArrayNotEmpty({ message: 'newLocations не должен быть пустым' }) // Проверяет, что массив не пустой

class DetailsForWhere {
  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsOptional()
  exactDate: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}

export class NewLocationAndDetailsDto extends DetailsForWhere {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateLocationDTO)
  newLocation: CreateLocationDTO;
}

export class LocationAndDetailsDto extends DetailsForWhere {
  @ApiProperty()
  @IsNumber()
  linkId: number;

  @ApiProperty()
  @IsNumber()
  existingLocationsId: number;

  @ApiProperty()
  @IsString()
  type: 'general' | 'user location';
}

export class MembersIdAndLinkIdDto {
  @ApiProperty()
  @IsNumber()
  linkId: number;

  @ApiProperty()
  @IsNumber()
  memberId: number;
}

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ type: [LocationAndDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationAndDetailsDto)
  existingLocationsAndDetails: LocationAndDetailsDto[];

  @ApiProperty({ type: [NewLocationAndDetailsDto] })
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
  @IsOptional()
  @IsDate({ message: 'Дата должна быть корректной' })
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  exactDate: Date;

  @IsEnum(DateType)
  dateType: DateType;

  @ApiProperty()
  @IsOptional()
  @IsDate({ message: 'Дата должна быть корректной' })
  whenRoomClose: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate({ message: 'Дата должна быть корректной' })
  whenRoomDeleted: Date;
}

export class UpdateRoomDto extends CreateRoomDto {
  //TODO что делать с автором при создании он нужен, при обновлении нет
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  authorId: number;

  @IsOptional()
  membersId: number[];

  @ApiProperty({ type: [MembersIdAndLinkIdDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MembersIdAndLinkIdDto)
  members: MembersIdAndLinkIdDto[];
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
