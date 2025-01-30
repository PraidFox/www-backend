import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ай дай имя плиз' })
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  locations: {
    id: number;
    name: string;
    url: string;
    address: string;
  };
}
