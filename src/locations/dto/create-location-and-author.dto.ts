import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Название локации точно должно быть' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;
}
