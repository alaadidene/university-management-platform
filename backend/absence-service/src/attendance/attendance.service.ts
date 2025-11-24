import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Seance } from './entities/seance.entity';
import { Presence } from './entities/presence.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import axios from 'axios';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Seance)
    private seanceRepository: Repository<Seance>,
    
    @InjectRepository(Presence)
    private presenceRepository: Repository<Presence>,
    
    private dataSource: DataSource,
  ) {}

  // Récupérer les étudiants d'une classe
  async getStudentsByClass(classeId: number, matiereId: number) {
    console.log('📚 getStudentsByClass appelé avec:', { classeId, matiereId });
    
    const query = `
      SELECT 
        e.id,
        e.prenom,
        e.nom,
        e.cin
      FROM etudiant e
      WHERE e."classeId" = $1
      ORDER BY e.nom, e.prenom
    `;

    try {
      const students = await this.dataSource.query(query, [classeId]);
      console.log('✅ Étudiants trouvés:', students.length, 'étudiants');
      console.log('👥 Liste:', students);
      return students;
    } catch (error) {
      console.error('❌ Erreur getStudentsByClass:', error);
      throw error;
    }
  }

  // Enregistrer les présences
  async saveAttendance(
    createAttendanceDto: CreateAttendanceDto,
    enseignantId: number,
  ) {
    console.log('💾 saveAttendance appelé:', { 
      createAttendanceDto, 
      enseignantId 
    });
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { cours, date, presences } = createAttendanceDto;
      
      console.log('📝 Données extraites:', { cours, date, presences: presences.length });

      // 1. Créer la séance
      const seance = this.seanceRepository.create({
        matiereId: cours.matiere,
        classeId: cours.classe,
        enseignantId: enseignantId,
        date: new Date(date),
        jour: cours.jour,
        horaire: cours.horaire,
      });
      
      console.log('🎓 Séance créée:', seance);

      const savedSeance = await queryRunner.manager.save(seance);
      console.log('✅ Séance enregistrée avec ID:', savedSeance.id);

      // 2. Créer toutes les présences
      const presencesToSave = presences.map((p) => {
        return this.presenceRepository.create({
          seanceId: savedSeance.id,
          etudiantId: p.etudiantId,
          statut: p.statut,
        });
      });
      
      console.log('👥 Présences à enregistrer:', presencesToSave.length);

      await queryRunner.manager.save(presencesToSave);
      console.log('✅ Présences enregistrées');

      // 3. Créer des notifications pour les étudiants absents
      const absentStudents = presences.filter(p => p.statut === 'absent');
      console.log('🔔 Étudiants absents:', absentStudents.length);
      
      if (absentStudents.length > 0) {
        // Récupérer les informations sur la matière et l'enseignant
        const matiereQuery = await this.dataSource.query(
          'SELECT nom FROM matiere WHERE id = $1',
          [cours.matiere]
        );
        const enseignantQuery = await this.dataSource.query(
          'SELECT nom, prenom FROM enseignant WHERE id = $1',
          [enseignantId]
        );

        const matiereNom = matiereQuery[0]?.nom || 'Matière inconnue';
        const enseignantNom = enseignantQuery[0] 
          ? `${enseignantQuery[0].prenom} ${enseignantQuery[0].nom}` 
          : 'Enseignant inconnu';

        // Envoyer les notifications pour chaque étudiant absent
        for (const absentStudent of absentStudents) {
          try {
            // Notification d'absence normale
            await axios.post(
              'http://localhost:3002/api/notifications',
              {
                etudiantId: absentStudent.etudiantId,
                type: 'absence',
                titre: 'Absence enregistrée',
                message: `Vous avez été marqué absent au cours de ${matiereNom} le ${new Date(date).toLocaleDateString('fr-FR')} (${cours.horaire}).`,
                matiereNom: matiereNom,
                date: new Date(date).toLocaleDateString('fr-FR'),
                enseignantNom: enseignantNom,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                }
              }
            );
            console.log('✅ Notification envoyée pour étudiant:', absentStudent.etudiantId);

            // Vérifier le nombre total d'absences dans cette matière
            const absencesCount = await this.dataSource.query(
              `SELECT COUNT(*) as total
               FROM presences p
               JOIN seances s ON p.seance_id = s.id
               WHERE p.etudiant_id = $1 
               AND s.matiere_id = $2 
               AND p.statut = 'absent'`,
              [absentStudent.etudiantId, cours.matiere]
            );

            const totalAbsences = parseInt(absencesCount[0].total);
            console.log(`📊 Étudiant ${absentStudent.etudiantId} - Total absences en ${matiereNom}: ${totalAbsences}`);

            // Si l'étudiant atteint 4 absences, envoyer une alerte d'élimination
            if (totalAbsences >= 4) {
              await axios.post(
                'http://localhost:3002/api/notifications',
                {
                  etudiantId: absentStudent.etudiantId,
                  type: 'elimination',
                  titre: '⚠️ ALERTE ÉLIMINATION',
                  message: `ATTENTION ! Vous avez atteint ${totalAbsences} absences en ${matiereNom}. Vous êtes maintenant ÉLIMINÉ de cette matière. Veuillez contacter l'administration ou votre enseignant.`,
                  matiereNom: matiereNom,
                  date: new Date(date).toLocaleDateString('fr-FR'),
                  enseignantNom: enseignantNom,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
              );
              console.log(`🚨 ALERTE ÉLIMINATION envoyée pour étudiant ${absentStudent.etudiantId} - ${totalAbsences} absences en ${matiereNom}`);
            } else if (totalAbsences === 3) {
              // Avertissement à 3 absences
              await axios.post(
                'http://localhost:3002/api/notifications',
                {
                  etudiantId: absentStudent.etudiantId,
                  type: 'avertissement',
                  titre: '⚠️ Avertissement - Risque d\'élimination',
                  message: `ATTENTION ! Vous avez ${totalAbsences} absences en ${matiereNom}. Une absence supplémentaire entraînera votre ÉLIMINATION de cette matière.`,
                  matiereNom: matiereNom,
                  date: new Date(date).toLocaleDateString('fr-FR'),
                  enseignantNom: enseignantNom,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
              );
              console.log(`⚠️ Avertissement envoyé pour étudiant ${absentStudent.etudiantId} - ${totalAbsences} absences en ${matiereNom}`);
            }

          } catch (error) {
            console.error('❌ Erreur envoi notification pour étudiant', absentStudent.etudiantId, ':', error.message);
            // Continue même si l'envoi de notification échoue
          }
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Transaction commitée');

      return {
        success: true,
        message: 'Présences enregistrées avec succès',
        seanceId: savedSeance.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Erreur saveAttendance:', error);
      console.error('❌ Stack:', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Récupérer l'historique des présences
  async getAttendanceHistory(
    matiereId: number,
    classeId: number,
    dateDebut: string,
    dateFin: string,
  ) {
    const query = `
      SELECT 
        s.id as seance_id,
        s.date,
        s.jour,
        s.horaire,
        p.etudiant_id,
        p.statut,
        e.prenom,
        e.nom
      FROM seances s
      LEFT JOIN presences p ON s.id = p.seance_id
      LEFT JOIN etudiant e ON p.etudiant_id = e.id
      WHERE s.matiere_id = $1 
        AND s.classe_id = $2
        AND s.date BETWEEN $3 AND $4
      ORDER BY s.date DESC, e.nom
    `;

    return await this.dataSource.query(query, [
      matiereId,
      classeId,
      dateDebut,
      dateFin,
    ]);
  }

  // Statistiques d'un étudiant
  async getStudentStats(etudiantId: number, semestre: number) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE p.statut = 'present') as total_presences,
        COUNT(*) FILTER (WHERE p.statut = 'absent') as total_absences,
        COUNT(*) as total_seances
      FROM presences p
      JOIN seances s ON p.seance_id = s.id
      WHERE p.etudiant_id = $1
    `;

    const result = await this.dataSource.query(query, [etudiantId]);
    return result[0];
  }
}