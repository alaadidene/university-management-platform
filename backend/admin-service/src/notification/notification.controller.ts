import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    console.log('🔔 API: Création notification reçue:', createNotificationDto);
    return await this.notificationService.create(createNotificationDto);
  }

  @Get('etudiant/:etudiantId')
  async findByEtudiant(@Param('etudiantId') etudiantId: string) {
    console.log('📬 API: Récupération notifications pour étudiant:', etudiantId);
    return await this.notificationService.findByEtudiant(+etudiantId);
  }

  @Get('etudiant/:etudiantId/unread')
  async findUnreadByEtudiant(@Param('etudiantId') etudiantId: string) {
    return await this.notificationService.findUnreadByEtudiant(+etudiantId);
  }

  @Get('etudiant/:etudiantId/count')
  async getUnreadCount(@Param('etudiantId') etudiantId: string) {
    const count = await this.notificationService.getUnreadCount(+etudiantId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.notificationService.markAsRead(+id);
  }

  @Patch('etudiant/:etudiantId/read-all')
  async markAllAsRead(@Param('etudiantId') etudiantId: string) {
    await this.notificationService.markAllAsRead(+etudiantId);
    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }
}
