import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('evenements')
export class Evenement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column('text')
  description: string;

  @Column({ type: 'date' })
  dateDebut: string;

  @Column({ type: 'date', nullable: true })
  dateFin: string;

  @Column({ nullable: true })
  lieu: string;

  @Column({ default: 'conference' }) // 'conference', 'journee_pedagogique', 'fermeture'
  type: string;

  @Column({ default: false })
  estAnnule: boolean;

  @CreateDateColumn()
  createdAt: Date;
}