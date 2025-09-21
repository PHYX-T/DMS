import { Injectable } from '@nestjs/common'

type Provider = 'sendgrid'|'msgraph'|'smtp'

@Injectable()
export class EmailService {
  private provider: Provider = (process.env.EMAIL_PROVIDER as Provider) || 'sendgrid'
  async send(userIdOrEmail: string, subject: string, text: string) {
    // Selecting provider by env
    switch (this.provider) {
      case 'sendgrid': return this.sendSendgrid(userIdOrEmail, subject, text)
      case 'msgraph': return this.sendMsGraph(userIdOrEmail, subject, text)
      default: return this.sendSmtp(userIdOrEmail, subject, text)
    }
  }
  private async sendSendgrid(to: string, subject: string, text: string) { /* integrate @sendgrid/mail */ return true }
  private async sendMsGraph(to: string, subject: string, text: string) { /* integrate Microsoft Graph / SMTP relay */ return true }
  private async sendSmtp(to: string, subject: string, text: string) { /* nodemailer */ return true }
}

