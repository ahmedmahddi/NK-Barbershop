import nodemailer from 'nodemailer';

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions) {
    try {
      const result = await this.transporter.sendMail(options);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection failed:', error);
      return false;
    }
  }

  // Helper method for booking confirmation emails
  async sendBookingConfirmation(bookingId: string, customerEmail: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; margin: 0;">Naim Kchao Barbershop</h1>
          <div style="width: 50px; height: 2px; background: #d4af37; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Confirmation de votre réservation</h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Numéro de réservation:</strong> ${bookingId}</p>
          <p style="margin: 0; color: #666;">Votre réservation a été confirmée avec succès !</p>
        </div>
        
        <p>Bonjour,</p>
        <p>Nous vous confirmons que votre réservation chez Naim Kchao Barbershop a été enregistrée.</p>
        <p>Nous avons hâte de vous accueillir dans notre salon.</p>
        
        <div style="background: #d4af37; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; text-align: center;"><strong>Merci de votre confiance !</strong></p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          Naim Kchao Barbershop<br>
          Email: naimkchaobarbershop@gmail.com
        </p>
      </div>
    `;

    return this.sendEmail({
      from: 'naimkchaobarbershop@gmail.com',
      to: customerEmail,
      subject: 'Confirmation de votre réservation - Naim Kchao Barbershop',
      text: `Votre réservation (ID: ${bookingId}) a été confirmée ! Merci de choisir Naim Kchao Barbershop.`,
      html,
    });
  }
}

// Create a singleton instance
export const emailService = new EmailService();
