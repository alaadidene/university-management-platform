import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Seance } from './entities/seance.entity';
import { Presence } from './entities/presence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seance, Presence])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}