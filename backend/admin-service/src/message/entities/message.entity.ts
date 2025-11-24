import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  senderEmail: string;

  @Column({ nullable: true })
  senderRole: string; // 'etudiant', 'enseignant', 'administratif', 'directeur_departement'

  @Column({ nullable: true })
  receiverEmail: string;

  @Column({ nullable: true })
  receiverRole: string;

  @Column({ nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}