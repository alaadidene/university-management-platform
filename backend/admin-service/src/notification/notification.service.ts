import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    console.log('🔔 Création de notification:', createNotificationDto);
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async findByEtudiant(etudiantId: number): Promise<Notification[]> {
    console.log('📬 Récupération notifications pour étudiant:', etudiantId);
    return await this.notificationRepository.find({
      where: { etudiantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByEtudiant(etudiantId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { etudiantId, lu: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(etudiantId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { etudiantId, lu: false },
    });
  }

  async markAsRead(id: number): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (notification) {
      notification.lu = true;
      return await this.notificationRepository.save(notification);
    }
    return null;
  }

  async markAllAsRead(etudiantId: number): Promise<void> {
    await this.notificationRepository.update(
      { etudiantId, lu: false },
      { lu: true },
    );
  }
}
