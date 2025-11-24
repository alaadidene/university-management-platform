import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity/utilisateur.entity';
import { randomBytes } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { generateEmailVerificationLink, generatePasswordResetLink, ensureFirebaseUser, updateFirebasePassword } from 'src/firebase/firebase.service';
import * as fs from 'fs';
import * as path from 'path';
import { validatePassword } from './password-validator';


const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilisateur) private readonly usersRepo: Repository<Utilisateur>,
    private readonly jwt: JwtService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource
  ) {}

  private async hash(s: string) {
    return bcrypt.hash(s, BCRYPT_ROUNDS);
  }
  private async compare(s: string, h: string) {
    return bcrypt.compare(s, h);
  }

  async login(email: string, password: string) {
    console.log('🔑 [Login] Attempt for email:', email);
    
    // 1️⃣ Vérifier dans la table utilisateur (admin/administratif)
    const admin = await this.usersRepo.findOne({ where: { email } });
    if (admin) {
      console.log('✅ [Login] Admin found:', admin.email);
      
      if (!admin.emailConfirmed) {
        console.log('❌ [Login] Email not confirmed');
        throw new ForbiddenException('Email non confirmé');
      }

      const ok = await this.compare(password, admin.mdp_hash);
      if (!ok) {
        console.log('❌ [Login] Password mismatch');
        throw new UnauthorizedException('Identifiants invalides');
      }

      if (admin.doit_changer_mdp) {
        console.log('⚠️ [Login] Password change required');
        return {
          success: false,
          message: 'Changement de mot de passe requis',
          mustChangePassword: true,
        };
      }

      const payload = {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        nom: admin.nom,
        prenom: admin.prenom,
        type: 'admin',
      };
      const access_token = await this.jwt.signAsync(payload);

      console.log('✅ [Login] Admin success!');
      return {
        success: true,
        message: 'Connexion réussie',
        type: 'admin',
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          nom: admin.nom,
          prenom: admin.prenom,
          cin: admin.cin,
        },
        token: access_token,
      };
    }

    // 2️⃣ Vérifier dans la table etudiant avec requête SQL brute
    const etudiantResult = await this.dataSource.query(
      `SELECT e.*, c.id as classeId, c.nom as "classeNom"
       FROM etudiant e
       LEFT JOIN classe c ON e."classeId" = c.id
       WHERE e.email = $1 LIMIT 1`,
      [email]
    );
    
    if (etudiantResult && etudiantResult.length > 0) {
      const etudiant = etudiantResult[0];
      console.log('✅ [Login] Etudiant found:', etudiant.email);
      console.log('🔍 [Login] Etudiant classeId:', etudiant.classeId, 'classeNom:', etudiant.classeNom);
      console.log('🔍 [Login] Full etudiant object:', etudiant);

      if (!etudiant.password) {
        throw new UnauthorizedException('Compte non activé');
      }

      const ok = await this.compare(password, etudiant.password);
      if (!ok) {
        console.log('❌ [Login] Password mismatch');
        throw new UnauthorizedException('Identifiants invalides');
      }

      if (etudiant.mustChangePassword) {
        console.log('⚠️ [Login] Password change required');
        return {
          success: false,
          message: 'Changement de mot de passe requis',
          mustChangePassword: true,
        };
      }

      const payload = {
        sub: etudiant.id,
        email: etudiant.email,
        role: 'etudiant',
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        type: 'etudiant',
      };
      const access_token = await this.jwt.signAsync(payload);

      console.log('✅ [Login] Etudiant success!');
      return {
        success: true,
        message: 'Connexion réussie',
        type: 'etudiant',
        user: {
          id: etudiant.id,
          email: etudiant.email,
          role: 'etudiant',
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          cin: etudiant.cin,
          classe: etudiant.classeNom ? { nom: etudiant.classeNom } : null,
        },
        token: access_token,
      };
    }

    // 3️⃣ Vérifier dans la table enseignant avec requête SQL brute
    const enseignantResult = await this.dataSource.query(
      `SELECT e.*, d.id as "departementId", d.nom as "departementNom" 
       FROM enseignant e 
       LEFT JOIN departement d ON e."departementId" = d.id 
       WHERE e.email = $1 LIMIT 1`,
      [email]
    );
    
    if (enseignantResult && enseignantResult.length > 0) {
      const enseignant = enseignantResult[0];
      console.log('✅ [Login] Enseignant found:', enseignant.email);

      if (!enseignant.password) {
        throw new UnauthorizedException('Compte non activé');
      }

      const ok = await this.compare(password, enseignant.password);
      if (!ok) {
        console.log('❌ [Login] Password mismatch');
        throw new UnauthorizedException('Identifiants invalides');
      }

      if (enseignant.mustChangePassword) {
        console.log('⚠️ [Login] Password change required');
        return {
          success: false,
          message: 'Changement de mot de passe requis',
          mustChangePassword: true,
        };
      }

      const role = enseignant.role || 'enseignant';
      const payload = {
        sub: enseignant.id,
        email: enseignant.email,
        role: role,
        nom: enseignant.nom,
        prenom: enseignant.prenom,
        type: role, // 'enseignant' ou 'directeur_departement'
      };
      const access_token = await this.jwt.signAsync(payload);

      console.log('✅ [Login] Enseignant success! Role:', role);
      
      // Construire l'objet user avec le département si c'est un directeur
      const userData: any = {
        id: enseignant.id,
        email: enseignant.email,
        role: role,
        nom: enseignant.nom,
        prenom: enseignant.prenom,
        cin: enseignant.cin,
      };
      
      // Ajouter le département si présent
      if (enseignant.departementId) {
        userData.departement = {
          id: enseignant.departementId,
          nom: enseignant.departementNom
        };
      }
      
      return {
        success: true,
        message: 'Connexion réussie',
        type: role,
        user: userData,
        token: access_token,
      };
    }

    // ❌ Aucun utilisateur trouvé
    console.log('❌ [Login] No user found in any table');
    throw new UnauthorizedException('Identifiants invalides');
  }

  async changePassword(email: string, currentPassword: string, newPassword: string) {
    // Valider le nouveau mot de passe
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    const hashedNewPassword = await this.hash(newPassword);

    // 1️⃣ Vérifier dans la table utilisateur (admin)
    const admin = await this.usersRepo.findOne({ where: { email } });
    if (admin) {
      const ok = await this.compare(currentPassword, admin.mdp_hash);
      if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect');

      admin.mdp_hash = hashedNewPassword;
      admin.doit_changer_mdp = false;
      await this.usersRepo.save(admin);

      const payload = {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        nom: admin.nom,
        prenom: admin.prenom,
        type: 'admin',
      };
      const access_token = await this.jwt.signAsync(payload);

      return {
        success: true,
        message: 'Mot de passe mis à jour',
        type: 'admin',
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          nom: admin.nom,
          prenom: admin.prenom,
        },
        token: access_token,
      };
    }

    // 2️⃣ Vérifier dans la table etudiant
    const etudiantResult = await this.dataSource.query(
      'SELECT * FROM etudiant WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (etudiantResult && etudiantResult.length > 0) {
      const etudiant = etudiantResult[0];
      const ok = await this.compare(currentPassword, etudiant.password);
      if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect');

      await this.dataSource.query(
        'UPDATE etudiant SET password = $1, "mustChangePassword" = false WHERE email = $2',
        [hashedNewPassword, email]
      );

      const payload = {
        sub: etudiant.id,
        email: etudiant.email,
        role: 'etudiant',
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        type: 'etudiant',
      };
      const access_token = await this.jwt.signAsync(payload);

      return {
        success: true,
        message: 'Mot de passe mis à jour',
        type: 'etudiant',
        user: {
          id: etudiant.id,
          email: etudiant.email,
          role: 'etudiant',
          nom: etudiant.nom,
          prenom: etudiant.prenom,
        },
        token: access_token,
      };
    }

    // 3️⃣ Vérifier dans la table enseignant
    const enseignantResult = await this.dataSource.query(
      'SELECT * FROM enseignant WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (enseignantResult && enseignantResult.length > 0) {
      const enseignant = enseignantResult[0];
      const ok = await this.compare(currentPassword, enseignant.password);
      if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect');

      await this.dataSource.query(
        'UPDATE enseignant SET password = $1, "mustChangePassword" = false WHERE email = $2',
        [hashedNewPassword, email]
      );

      const role = enseignant.role || 'enseignant';
      const payload = {
        sub: enseignant.id,
        email: enseignant.email,
        role: role,
        nom: enseignant.nom,
        prenom: enseignant.prenom,
        type: role,
      };
      const access_token = await this.jwt.signAsync(payload);

      return {
        success: true,
        message: 'Mot de passe mis à jour',
        type: role,
        user: {
          id: enseignant.id,
          email: enseignant.email,
          role: role,
          nom: enseignant.nom,
          prenom: enseignant.prenom,
        },
        token: access_token,
      };
    }

    // ❌ Aucun utilisateur trouvé
    throw new UnauthorizedException('Utilisateur introuvable');
  }

  async updateProfile(email: string, updates: { nom?: string; prenom?: string; cin?: string }) {
    console.log('🔄 [UpdateProfile] Email:', email);
    console.log('🔄 [UpdateProfile] Updates:', updates);
    
    // 1️⃣ Vérifier dans la table utilisateur (admin/administratif)
    const user = await this.usersRepo.findOne({ where: { email } });
    
    if (user) {
      console.log('✅ [UpdateProfile] Admin/User found:', user.nom, user.prenom);

      if (updates.nom !== undefined) user.nom = updates.nom;
      if (updates.prenom !== undefined) user.prenom = updates.prenom;
      if (updates.cin !== undefined) user.cin = updates.cin;

      console.log('💾 [UpdateProfile] Saving updates...');
      await this.usersRepo.save(user);
      console.log('✅ [UpdateProfile] Saved successfully');

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          cin: user.cin,
          role: user.role,
        },
      };
    }

    // 2️⃣ Vérifier dans la table enseignant
    console.log('🔍 [UpdateProfile] Not found in utilisateur, checking enseignant...');
    const enseignantResult = await this.dataSource.query(
      `SELECT e.id, e.email, e.nom, e.prenom, e.cin, e.role, e."departementId",
              d.id as "departement_id", d.nom as "departement_nom"
       FROM enseignant e
       LEFT JOIN departement d ON e."departementId" = d.id
       WHERE e.email = $1`,
      [email]
    );

    if (enseignantResult && enseignantResult.length > 0) {
      const enseignant = enseignantResult[0];
      console.log('✅ [UpdateProfile] Enseignant found:', enseignant.nom, enseignant.prenom);

      // Construire la requête UPDATE dynamiquement
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.nom !== undefined) {
        updateFields.push(`nom = $${paramIndex++}`);
        updateValues.push(updates.nom);
      }
      if (updates.prenom !== undefined) {
        updateFields.push(`prenom = $${paramIndex++}`);
        updateValues.push(updates.prenom);
      }
      if (updates.cin !== undefined) {
        updateFields.push(`cin = $${paramIndex++}`);
        updateValues.push(updates.cin);
      }

      if (updateFields.length > 0) {
        updateValues.push(email);
        const updateQuery = `UPDATE enseignant SET ${updateFields.join(', ')} WHERE email = $${paramIndex}`;
        
        console.log('💾 [UpdateProfile] Updating enseignant with query:', updateQuery);
        console.log('💾 [UpdateProfile] Values:', updateValues);
        
        await this.dataSource.query(updateQuery, updateValues);
        console.log('✅ [UpdateProfile] Enseignant updated successfully');
      }

      // Récupérer les données mises à jour
      const updatedResult = await this.dataSource.query(
        `SELECT e.id, e.email, e.nom, e.prenom, e.cin, e.role,
                d.id as "departement_id", d.nom as "departement_nom"
         FROM enseignant e
         LEFT JOIN departement d ON e."departementId" = d.id
         WHERE e.email = $1`,
        [email]
      );

      const updatedEnseignant = updatedResult[0];
      const userData: any = {
        id: updatedEnseignant.id,
        email: updatedEnseignant.email,
        nom: updatedEnseignant.nom,
        prenom: updatedEnseignant.prenom,
        cin: updatedEnseignant.cin,
        role: updatedEnseignant.role,
      };

      if (updatedEnseignant.departement_id) {
        userData.departement = {
          id: updatedEnseignant.departement_id,
          nom: updatedEnseignant.departement_nom
        };
      }

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        user: userData,
      };
    }

    // 3️⃣ Vérifier dans la table etudiant
    console.log('🔍 [UpdateProfile] Not found in enseignant, checking etudiant...');
    const etudiantResult = await this.dataSource.query(
      `SELECT et.id, et.email, et.nom, et.prenom, et.cin, et.role, et."classeId",
              c.nom as "classe_nom", c."specialiteId",
              s.nom as "specialite_nom", s."departementId",
              d.id as "departement_id", d.nom as "departement_nom"
       FROM etudiant et
       LEFT JOIN classe c ON et."classeId" = c.id
       LEFT JOIN specialite s ON c."specialiteId" = s.id
       LEFT JOIN departement d ON s."departementId" = d.id
       WHERE et.email = $1`,
      [email]
    );

    if (etudiantResult && etudiantResult.length > 0) {
      const etudiant = etudiantResult[0];
      console.log('✅ [UpdateProfile] Etudiant found:', etudiant.nom, etudiant.prenom);

      // Construire la requête UPDATE dynamiquement
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.nom !== undefined) {
        updateFields.push(`nom = $${paramIndex++}`);
        updateValues.push(updates.nom);
      }
      if (updates.prenom !== undefined) {
        updateFields.push(`prenom = $${paramIndex++}`);
        updateValues.push(updates.prenom);
      }
      if (updates.cin !== undefined) {
        updateFields.push(`cin = $${paramIndex++}`);
        updateValues.push(updates.cin);
      }

      if (updateFields.length > 0) {
        updateValues.push(email);
        const updateQuery = `UPDATE etudiant SET ${updateFields.join(', ')} WHERE email = $${paramIndex}`;
        
        console.log('💾 [UpdateProfile] Updating etudiant with query:', updateQuery);
        console.log('💾 [UpdateProfile] Values:', updateValues);
        
        await this.dataSource.query(updateQuery, updateValues);
        console.log('✅ [UpdateProfile] Etudiant updated successfully');
      }

      // Récupérer les données mises à jour
      const updatedResult = await this.dataSource.query(
        `SELECT et.id, et.email, et.nom, et.prenom, et.cin, et.role,
                c.id as "classe_id", c.nom as "classe_nom",
                s.id as "specialite_id", s.nom as "specialite_nom",
                d.id as "departement_id", d.nom as "departement_nom"
         FROM etudiant et
         LEFT JOIN classe c ON et."classeId" = c.id
         LEFT JOIN specialite s ON c."specialiteId" = s.id
         LEFT JOIN departement d ON s."departementId" = d.id
         WHERE et.email = $1`,
        [email]
      );

      const updatedEtudiant = updatedResult[0];
      const userData: any = {
        id: updatedEtudiant.id,
        email: updatedEtudiant.email,
        nom: updatedEtudiant.nom,
        prenom: updatedEtudiant.prenom,
        cin: updatedEtudiant.cin,
        role: updatedEtudiant.role,
      };

      if (updatedEtudiant.classe_id) {
        userData.classe = {
          id: updatedEtudiant.classe_id,
          nom: updatedEtudiant.classe_nom
        };
      }

      if (updatedEtudiant.specialite_id) {
        userData.specialite = {
          id: updatedEtudiant.specialite_id,
          nom: updatedEtudiant.specialite_nom
        };
      }

      if (updatedEtudiant.departement_id) {
        userData.departement = {
          id: updatedEtudiant.departement_id,
          nom: updatedEtudiant.departement_nom
        };
      }

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        user: userData,
      };
    }

    // Si aucun utilisateur n'est trouvé
    console.log('❌ [UpdateProfile] Not found in any table');
    throw new UnauthorizedException('Utilisateur introuvable');
  }

  // Utilitaire pour import initial: mdp = hash(CIN) + forcer changement
  async setInitialPasswordFromCIN(userId: number, cin: string) {
    const mdpHash = await this.hash(cin);
    await this.usersRepo.update(userId, { mdp_hash: mdpHash, doit_changer_mdp: true });
  }
  
  async confirmEmail(email: string, token: string) {
    const user = await this.usersRepo.findOne({ where: { email, confirmationToken: token } });
    if (!user) throw new BadRequestException('Token invalide ou email incorrect');

    user.emailConfirmed = true;
    user.confirmationToken = null;
    console.log('Updating user:', user);
    await this.usersRepo.save(user);

    return { message: 'Email confirmé avec succès' };
  }


  async resendConfirmation(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (user.emailConfirmed) {
      throw new BadRequestException('Email déjà confirmé');
    }

    const token = randomBytes(32).toString('hex');
    user.confirmationToken = token;
    await this.usersRepo.save(user);
    // Ensure user exists in Firebase Auth and generate verification link
    // await ensureFirebaseUser(email, user.cin ?? 'TempPass123!');
    const continueUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/confirm-email?email=${encodeURIComponent(email)}&token=${token}`;
    const link = continueUrl; // await generateEmailVerificationLink(email, continueUrl);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmation de votre email',
      text: `Cliquez ici pour confirmer votre email : ${link}`,
      html: `<p>Bonjour ${user.prenom || user.email},</p><p>Cliquez sur le lien suivant pour confirmer votre email:</p><p><a href="${link}">Confirmer mon email</a></p>`,
    });

    // TODO: Send email with confirmation link
    // Example: http://localhost:3000/auth/confirm-email?email=...&token=...

    return { message: 'Lien de confirmation renvoyé' };
  }
   
  async forgotPassword(email: string) {
    console.log('🔍 [ForgotPassword] Started for email:', email);
    
    // 1️⃣ Check in utilisateur table (admin/administratif)
    const user = await this.usersRepo.findOne({ where: { email } });
    if (user) {
      console.log('✅ [ForgotPassword] User found in utilisateur table:', user.email);

      try {
        // Generate our own reset token (not Firebase)
        const token = randomBytes(32).toString('hex');
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 1); // Token expires in 1 hour

        user.resetToken = token;
        user.resetTokenExpires = expiresIn;
        await this.usersRepo.save(user);
        console.log('💾 [ForgotPassword] Token saved to database');

        // Create direct link to OUR reset password page with OUR token
        const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3005'}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
        console.log('🔗 [ForgotPassword] Reset URL:', resetUrl);
        
        // Send email with OUR link (not Firebase)
        console.log('📧 [ForgotPassword] Sending email...');
        
        await this.mailerService.sendMail({
          to: email,
          subject: '🔐 Réinitialisation de votre mot de passe - ISETT',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #667eea; margin-bottom: 30px; }
                .button { display: inline-block; padding: 15px 30px; background-color: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Réinitialisation de mot de passe</h1>
                </div>
                <p>Bonjour <strong>${user.prenom || user.nom}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ISETT.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <p><strong>⏱️ Ce lien est valable pendant 1 heure.</strong></p>
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <p style="color: #e53e3e; margin-top: 20px;">⚠️ <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>Ignorez simplement cet email. Votre mot de passe reste sécurisé.</p>
                <div class="footer">
                  <p><strong>Équipe ISETT</strong></p>
                  <p>© ${new Date().getFullYear()} ISETT. Tous droits réservés.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('✅ [ForgotPassword] Email sent successfully!');
      } catch (error) {
        console.error('❌ [ForgotPassword] Error:', error);
        throw error;
      }

      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // 2️⃣ Check in etudiant table
    const etudiantResult = await this.dataSource.query(
      'SELECT * FROM etudiant WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (etudiantResult && etudiantResult.length > 0) {
      const etudiant = etudiantResult[0];
      console.log('✅ [ForgotPassword] User found in etudiant table:', etudiant.email);

      try {
        const token = randomBytes(32).toString('hex');
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 1);

        await this.dataSource.query(
          'UPDATE etudiant SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE email = $3',
          [token, expiresIn, email]
        );
        console.log('💾 [ForgotPassword] Token saved to etudiant table');

        const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3005'}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
        console.log('🔗 [ForgotPassword] Reset URL:', resetUrl);
        
        console.log('📧 [ForgotPassword] Sending email...');
        
        await this.mailerService.sendMail({
          to: email,
          subject: '🔐 Réinitialisation de votre mot de passe - ISETT',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #667eea; margin-bottom: 30px; }
                .button { display: inline-block; padding: 15px 30px; background-color: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Réinitialisation de mot de passe</h1>
                </div>
                <p>Bonjour <strong>${etudiant.prenom || etudiant.nom}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ISETT.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <p><strong>⏱️ Ce lien est valable pendant 1 heure.</strong></p>
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <p style="color: #e53e3e; margin-top: 20px;">⚠️ <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>Ignorez simplement cet email. Votre mot de passe reste sécurisé.</p>
                <div class="footer">
                  <p><strong>Équipe ISETT</strong></p>
                  <p>© ${new Date().getFullYear()} ISETT. Tous droits réservés.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('✅ [ForgotPassword] Email sent successfully!');
      } catch (error) {
        console.error('❌ [ForgotPassword] Error:', error);
        throw error;
      }

      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // 3️⃣ Check in enseignant table
    const enseignantResult = await this.dataSource.query(
      'SELECT * FROM enseignant WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (enseignantResult && enseignantResult.length > 0) {
      const enseignant = enseignantResult[0];
      console.log('✅ [ForgotPassword] User found in enseignant table:', enseignant.email);

      try {
        const token = randomBytes(32).toString('hex');
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 1);

        await this.dataSource.query(
          'UPDATE enseignant SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE email = $3',
          [token, expiresIn, email]
        );
        console.log('💾 [ForgotPassword] Token saved to enseignant table');

        const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3005'}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
        console.log('🔗 [ForgotPassword] Reset URL:', resetUrl);
        
        console.log('📧 [ForgotPassword] Sending email...');
        
        await this.mailerService.sendMail({
          to: email,
          subject: '🔐 Réinitialisation de votre mot de passe - ISETT',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #667eea; margin-bottom: 30px; }
                .button { display: inline-block; padding: 15px 30px; background-color: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Réinitialisation de mot de passe</h1>
                </div>
                <p>Bonjour <strong>${enseignant.prenom || enseignant.nom}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ISETT.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <p><strong>⏱️ Ce lien est valable pendant 1 heure.</strong></p>
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <p style="color: #e53e3e; margin-top: 20px;">⚠️ <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>Ignorez simplement cet email. Votre mot de passe reste sécurisé.</p>
                <div class="footer">
                  <p><strong>Équipe ISETT</strong></p>
                  <p>© ${new Date().getFullYear()} ISETT. Tous droits réservés.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('✅ [ForgotPassword] Email sent successfully!');
      } catch (error) {
        console.error('❌ [ForgotPassword] Error:', error);
        throw error;
      }

      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // ❌ No user found in any table
    console.log('⚠️ [ForgotPassword] User not found for email:', email);
    // Don't reveal if user exists for security
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    console.log('🔐 [ResetPassword] Started for email:', email);
    console.log('🔐 [ResetPassword] Token received:', token);
    console.log('🔐 [ResetPassword] Token length:', token?.length);
    
    const user = await this.usersRepo.findOne({ where: { email, resetToken: token } });
    
    if (!user) {
      console.log('❌ [ResetPassword] User not found or token mismatch');
      // Try to find user by email only to check if token matches
      const userByEmail = await this.usersRepo.findOne({ where: { email } });
      if (userByEmail) {
        console.log('🔍 [ResetPassword] User exists but token mismatch');
        console.log('🔍 [ResetPassword] Stored token:', userByEmail.resetToken);
        console.log('🔍 [ResetPassword] Token expires:', userByEmail.resetTokenExpires);
        console.log('🔍 [ResetPassword] Current time:', new Date());
      } else {
        console.log('🔍 [ResetPassword] User with this email does not exist');
      }
      throw new BadRequestException('Token invalide ou expiré');
    }

    console.log('✅ [ResetPassword] User found:', user.email);
    console.log('🔐 [ResetPassword] Token expires:', user.resetTokenExpires);

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      console.log('❌ [ResetPassword] Token expired');
      throw new BadRequestException('Le token a expiré');
    }

    // Valider le nouveau mot de passe
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      console.log('❌ [ResetPassword] Password validation failed:', validation.errors);
      throw new BadRequestException(validation.errors.join(', '));
    }

    console.log('🔐 [ResetPassword] Hashing new password...');
    const newHash = await this.hash(newPassword);
    console.log('🔐 [ResetPassword] New hash generated:', newHash.substring(0, 20) + '...');
    
    user.mdp_hash = newHash;
    user.resetToken = null as any;
    user.resetTokenExpires = null as any;
    user.doit_changer_mdp = false;
    
    await this.usersRepo.save(user);
    console.log('✅ [ResetPassword] Password saved to database');

    // Update password in Firebase as well
    // try {
    //   await updateFirebasePassword(email, newPassword);
    //   console.log('✅ [ResetPassword] Firebase password updated');
    // } catch (err) {
    //   // Log and continue; DB password is authoritative
    //   console.warn('⚠️ [ResetPassword] Failed to update firebase password', err);
    // }

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async getUsersByRole(role: string) {
    return this.usersRepo.find({
      where: { role },
      select: ['id', 'nom', 'prenom', 'email', 'role'],
    });
  }
}
