import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocationEntity } from './entities/user-location.entity';
import { GeneralLocationEntity } from './entities/general-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLocationEntity, GeneralLocationEntity])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
