import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // GET /api/students/by-class/:classeId/matiere/:matiereId
  @Get('students/by-class/:classeId/matiere/:matiereId')
  async getStudentsByClass(
    @Param('classeId') classeId: number,
    @Param('matiereId') matiereId: number,
  ) {
    return this.attendanceService.getStudentsByClass(
      Number(classeId),
      Number(matiereId),
    );
  }

  // POST /api/attendance
  @Post('attendance')
  async saveAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Request() req,
  ) {
    console.log('🔐 req.user:', req.user);
    const enseignantId = req.user?.id || req.user?.userId || req.user?.sub;
    console.log('👨‍🏫 enseignantId extrait:', enseignantId);
    
    return this.attendanceService.saveAttendance(
      createAttendanceDto,
      enseignantId,
    );
  }

  // GET /api/attendance/history
  @Get('attendance/history')
  async getAttendanceHistory(
    @Query('matiereId') matiereId: number,
    @Query('classeId') classeId: number,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    return this.attendanceService.getAttendanceHistory(
      Number(matiereId),
      Number(classeId),
      dateDebut,
      dateFin,
    );
  }

  // GET /api/attendance/student/:etudiantId/stats
  @Get('attendance/student/:etudiantId/stats')
  async getStudentStats(
    @Param('etudiantId') etudiantId: number,
    @Query('semestre') semestre: number,
  ) {
    return this.attendanceService.getStudentStats(
      Number(etudiantId),
      Number(semestre),
    );
  }
}