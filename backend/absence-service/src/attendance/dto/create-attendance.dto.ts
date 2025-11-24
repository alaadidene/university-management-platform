import { IsNotEmpty, IsArray, IsDateString, IsObject } from 'class-validator';

class CoursDto {
  @IsNotEmpty()
  matiere: number;

  @IsNotEmpty()
  classe: number;

  @IsNotEmpty()
  jour: string;

  @IsNotEmpty()
  horaire: string;
}

class PresenceDto {
  @IsNotEmpty()
  etudiantId: number;

  @IsNotEmpty()
  statut: string;
}

export class CreateAttendanceDto {
  @IsObject()
  @IsNotEmpty()
  cours: CoursDto;

  @IsDateString()
  date: string;

  @IsArray()
  presences: PresenceDto[];
}