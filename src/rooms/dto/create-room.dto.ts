import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateLocationDto } from '../../locations/dto/create-location.dto';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ай дай имя плиз' })
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  @Type(() => LocationMoreInfoDto)
  @IsOptional()
  existingLocations?: LocationMoreInfoDto[];

  @ApiProperty()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateLocationDto)
  newLocations?: NewLocationMoreInfoDto[];

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true }) // Проверяет, что каждый элемент массива — это число
  @ArrayNotEmpty() // (опционально) Проверяет, что массив не пустой, если он присутствует
  membersId: number[];

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @IsOptional()
  whenRoomClose: Date;

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  @IsOptional()
  whenRoomDeleted: Date;
}

export interface UpdateRoomDto extends Omit<CreateRoomDto, 'authorId'> {
  id: number;
  roomStatus: 'создан' | 'процесс пошел' | 'выполняется' | 'закрыта';
}

export class NewLocationMoreInfoDto extends CreateLocationDto {
  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  exactDate: Date;

  @IsString()
  @IsOptional()
  description: string;
}

export class LocationMoreInfoDto {
  @ApiProperty()
  @IsNumber()
  existingLocationsId: number;

  @ApiProperty()
  @IsDate({ message: 'Дата должна быть корректной' })
  exactDate: Date;

  @IsString()
  @IsOptional()
  description: string;
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
