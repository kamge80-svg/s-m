import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  username: string;
  email: string;
}

export interface PurchaseEmailData {
  username: string;
  email: string;
  productTitle: string;
  amount: number;
  purchaseDate: string;
}

export interface SaleNotificationData {
  sellerEmail: string;
  sellerUsername: string;
  productTitle: string;
  amount: number;
  buyerUsername: string;
}

/**
 * Email service for sending transactional emails
 * Uses Supabase Edge Functions or external email service
 */
class EmailService {
  private readonly FROM_EMAIL = 'noreply@sim-marketplace.com';
  private readonly FROM_NAME = 'sîm Marketplace';

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const template = this.getWelcomeTemplate(data);
      return await this.sendEmail(template);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send purchase confirmation to buyer
   */
  async sendPurchaseConfirmation(data: PurchaseEmailData): Promise<boolean> {
    try {
      const template = this.getPurchaseTemplate(data);
      return await this.sendEmail(template);
    } catch (error) {
      logger.error('Failed to send purchase confirmation:', error);
      return false;
    }
  }

  /**
   * Send sale notification to seller
   */
  async sendSaleNotification(data: SaleNotificationData): Promise<boolean> {
    try {
      const template = this.getSaleTemplate(data);
      return await this.sendEmail(template);
    } catch (error) {
      logger.error('Failed to send sale notification:', error);
      return false;
    }
  }

  /**
   * Core email sending function
   * TODO: Implement with Supabase Edge Function or external service (SendGrid, Resend, etc.)
   */
  private async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Option 1: Use Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: template,
      });

      if (error) {
        logger.error('Email sending failed:', error);
        return false;
      }

      logger.info('Email sent successfully', { to: template.to, subject: template.subject });
      return true;
    } catch (error) {
      // Fallback: Log for manual processing
      logger.warn('Email queued for manual processing', template);
      
      // TODO: Store in email_queue table for retry
      await this.queueEmail(template);
      
      return false;
    }
  }

  /**
   * Queue email for later processing
   */
  private async queueEmail(template: EmailTemplate): Promise<void> {
    try {
      await supabase.from('email_queue').insert({
        to_email: template.to,
        subject: template.subject,
        html_body: template.html,
        text_body: template.text,
        status: 'pending',
      });
    } catch (error) {
      logger.error('Failed to queue email:', error);
    }
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
    return {
      to: data.email,
      subject: `Welcome to sîm Marketplace, ${data.username}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to sîm! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.username}</strong>,</p>
              <p>Welcome to sîm Marketplace - the TikTok-style marketplace for digital products!</p>
              <p>You can now:</p>
              <ul>
                <li>📱 Browse amazing digital products</li>
                <li>💰 Sell your own creations</li>
                <li>🎓 Create and sell courses</li>
                <li>📊 Track your analytics</li>
              </ul>
              <a href="${window.location.origin}" class="button">Start Exploring</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy selling! 🚀</p>
            </div>
            <div class="footer">
              <p>© 2025 sîm Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to sîm Marketplace, ${data.username}! Start exploring amazing digital products and sell your own creations.`,
    };
  }

  /**
   * Purchase confirmation template
   */
  private getPurchaseTemplate(data: PurchaseEmailData): EmailTemplate {
    return {
      to: data.email,
      subject: `Purchase Confirmed: ${data.productTitle} 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .purchase-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Purchase Confirmed! ✅</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.username}</strong>,</p>
              <p>Thank you for your purchase! Your order has been confirmed.</p>
              <div class="purchase-details">
                <h3>Order Details</h3>
                <p><strong>Product:</strong> ${data.productTitle}</p>
                <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> ${data.purchaseDate}</p>
              </div>
              <a href="${window.location.origin}#purchases" class="button">View Purchase</a>
              <p>You can now access your purchased content from your account.</p>
            </div>
            <div class="footer">
              <p>© 2025 sîm Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Purchase confirmed: ${data.productTitle} for $${data.amount.toFixed(2)}. View your purchase at ${window.location.origin}#purchases`,
    };
  }

  /**
   * Sale notification template
   */
  private getSaleTemplate(data: SaleNotificationData): EmailTemplate {
    return {
      to: data.sellerEmail,
      subject: `You made a sale! 💰 ${data.productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .sale-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #10b981; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You Made a Sale!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.sellerUsername}</strong>,</p>
              <p>Great news! Someone just purchased your product.</p>
              <div class="sale-details">
                <h3>Sale Details</h3>
                <p><strong>Product:</strong> ${data.productTitle}</p>
                <p><strong>Buyer:</strong> @${data.buyerUsername}</p>
                <p><strong>Your Earnings:</strong></p>
                <p class="amount">$${(data.amount * 0.93).toFixed(2)}</p>
                <p style="color: #666; font-size: 14px;">Platform fee (7%): $${(data.amount * 0.07).toFixed(2)}</p>
              </div>
              <a href="${window.location.origin}#analytics" class="button">View Analytics</a>
              <p>Keep up the great work! 🚀</p>
            </div>
            <div class="footer">
              <p>© 2025 sîm Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `You made a sale! ${data.productTitle} sold to @${data.buyerUsername} for $${data.amount.toFixed(2)}. Your earnings: $${(data.amount * 0.93).toFixed(2)}`,
    };
  }
}

export const emailService = new EmailService();
