import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClasseModule } from './classe/classe.module';
import { NiveauModule } from './niveau/niveau.module';
import { SpecialiteModule } from './specialite/specialite.module';
import { DepartementModule } from './departement/departement.module';
import { EnseignantModule } from './enseignant/enseignant.module';
import { EtudiantModule } from './etudiant/etudiant.module';
import { SalleModule } from './salle/salle.module';
import { MatiereModule } from './matiere/matiere.module';
import { MessageModule } from './message/message.module';
import { DirecteurModule } from './directeur/directeur.module';
import { EvenementModule } from './evenement/evenement.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'university_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    DepartementModule,
    EnseignantModule,
    SpecialiteModule,
    NiveauModule,
    ClasseModule,
    EtudiantModule,
    SalleModule,
    MatiereModule,
    MessageModule,
    DirecteurModule,
    EvenementModule,
    NotificationModule,
  ],
})
export class AppModule {}
