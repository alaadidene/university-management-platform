import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Seance } from './seance.entity';

@Entity('presences')
export class Presence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seance_id' })
  seanceId: number;

  @Column({ name: 'etudiant_id' })
  etudiantId: number;

  @Column({ length: 10 })
  statut: string; // 'present' ou 'absent'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Seance, seance => seance.presences)
  @JoinColumn({ name: 'seance_id' })
  seance: Seance;
}