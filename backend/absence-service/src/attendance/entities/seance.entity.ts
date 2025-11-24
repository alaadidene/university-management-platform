import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Presence } from './presence.entity';

@Entity('seances')
export class Seance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'matiere_id' })
  matiereId: number;

  @Column({ name: 'classe_id' })
  classeId: number;

  @Column({ name: 'enseignant_id' })
  enseignantId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 20 })
  jour: string;

  @Column({ length: 20 })
  horaire: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Presence, (presence: Presence) => presence.seance)
  presences: Presence[];
}