const nodemailer = require('nodemailer');
const SavedSearch = require('../models/SavedSearch');
const { formatTenderResponse, formatDisplayDate } = require('../utils/formatters');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
        } else {
          console.log('Email transporter is ready');
        }
      });
    } else {
      console.warn('Email configuration not found. Email notifications will be disabled.');
    }
  }

  // Send email notification
  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.transporter) {
      console.warn('Email transporter not configured. Skipping email notification.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"TenderMatch Pro" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Strip HTML tags for text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Generate tender alert email HTML
  generateTenderAlertEmail(savedSearch, newTenders, userEmail) {
    const tenderCount = newTenders.length;
    const searchName = savedSearch.name;
    
    const tenderListHtml = newTenders.map(tender => {
      const formattedTender = formatTenderResponse(tender);
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #ffffff;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px;">${tender.title}</h3>
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
            <strong>Tender ID:</strong> ${tender.tender_ref_no}<br>
            <strong>Department:</strong> ${tender.department}<br>
            <strong>Location:</strong> ${tender.city}, ${tender.state}<br>
            <strong>Category:</strong> ${tender.category}<br>
            <strong>Budget:</strong> ${formattedTender.budget_max_formatted}<br>
            <strong>Deadline:</strong> ${formattedTender.bid_deadline_formatted}
          </div>
          <p style="color: #374151; margin: 0 0 12px 0; line-height: 1.5;">
            ${formattedTender.description_short}
          </p>
          <a href="${process.env.FRONTEND_URL}/tenders/${tender.id}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
            View Details
          </a>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Tender Matches - TenderMatch Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">TenderMatch Pro</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px;">New Tender Alert</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0;">Hello!</h2>
          <p style="margin: 0 0 16px 0;">
            We found <strong>${tenderCount}</strong> new tender${tenderCount > 1 ? 's' : ''} matching your saved search "<strong>${searchName}</strong>".
          </p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0;">New Tender Matches:</h3>
          ${tenderListHtml}
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0 0 16px 0; color: #6b7280;">
            <a href="${process.env.FRONTEND_URL}/saved-searches" 
               style="color: #3b82f6; text-decoration: none;">Manage your saved searches</a> | 
            <a href="${process.env.FRONTEND_URL}/tenders" 
               style="color: #3b82f6; text-decoration: none;">Browse all tenders</a>
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            You received this email because you have alerts enabled for the saved search "${searchName}". 
            <a href="${process.env.FRONTEND_URL}/saved-searches" style="color: #6b7280;">Manage notifications</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Send tender alert notifications
  async sendTenderAlerts() {
    try {
      console.log('Checking for tender alert notifications...');
      
      // Get all saved searches with alerts enabled
      const savedSearches = await SavedSearch.findWithAlertsEnabled();
      
      if (savedSearches.length === 0) {
        console.log('No saved searches with alerts enabled found.');
        return;
      }

      console.log(`Found ${savedSearches.length} saved searches with alerts enabled.`);
      
      // Check for new matches since last 24 hours
      const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let totalNotificationsSent = 0;

      for (const savedSearch of savedSearches) {
        try {
          // Find new matches for this saved search
          const newMatches = await savedSearch.findNewMatches(since24Hours);
          
          if (newMatches.length > 0) {
            console.log(`Found ${newMatches.length} new matches for search "${savedSearch.name}" (${savedSearch.user_email})`);
            
            // Generate and send email
            const subject = `${newMatches.length} New Tender${newMatches.length > 1 ? 's' : ''} Match Your Search - TenderMatch Pro`;
            const htmlContent = this.generateTenderAlertEmail(savedSearch, newMatches, savedSearch.user_email);
            
            const emailSent = await this.sendEmail(savedSearch.user_email, subject, htmlContent);
            
            if (emailSent) {
              totalNotificationsSent++;
              console.log(`Alert sent to ${savedSearch.user_email} for search "${savedSearch.name}"`);
            }
          }
        } catch (error) {
          console.error(`Error processing alerts for saved search ${savedSearch.id}:`, error);
        }
      }

      console.log(`Tender alert check completed. ${totalNotificationsSent} notifications sent.`);
      return totalNotificationsSent;
      
    } catch (error) {
      console.error('Error in sendTenderAlerts:', error);
      throw error;
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail, userName, companyName) {
    const subject = 'Welcome to TenderMatch Pro - Your Government Tender Platform';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TenderMatch Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to TenderMatch Pro!</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0;">Hello ${userName || 'there'}!</h2>
          <p style="margin: 0 0 16px 0;">
            Thank you for joining TenderMatch Pro, India's comprehensive government tender aggregation platform.
          </p>
          <p style="margin: 0 0 16px 0;">
            We're excited to help ${companyName || 'your company'} discover and track government tenders across all states and departments.
          </p>
          
          <h3 style="color: #1f2937; margin: 24px 0 16px 0;">What you can do now:</h3>
          <ul style="margin: 0 0 16px 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Browse thousands of active government tenders</li>
            <li style="margin-bottom: 8px;">Set up saved searches with custom alerts</li>
            <li style="margin-bottom: 8px;">Save tenders to your favorites</li>
            <li style="margin-bottom: 8px;">Filter by state, category, department, and budget</li>
          </ul>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL}/tenders" 
               style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Start Browsing Tenders
            </a>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #6b7280;">
            Need help? Contact our support team at 
            <a href="mailto:support@tendermatch.pro" style="color: #3b82f6;">support@tendermatch.pro</a>
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            TenderMatch Pro - Your Gateway to Government Tenders
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken) {
    const subject = 'Reset Your TenderMatch Pro Password';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - TenderMatch Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0;">Reset Your Password</h2>
          <p style="margin: 0 0 16px 0;">
            We received a request to reset your TenderMatch Pro password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. The link will expire in 1 hour.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send email verification
  async sendEmailVerification(userEmail, verificationToken) {
    const subject = 'Verify Your TenderMatch Pro Email Address';
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - TenderMatch Pro</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0;">Almost There!</h2>
          <p style="margin: 0 0 16px 0;">
            Please verify your email address to complete your TenderMatch Pro registration and start receiving tender alerts.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            If the button doesn't work, copy and paste this link: ${verificationUrl}
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Test email configuration
  async testEmailConfiguration() {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    const testEmail = process.env.SMTP_USER;
    const subject = 'TenderMatch Pro - Email Configuration Test';
    const htmlContent = `
      <h2>Email Configuration Test</h2>
      <p>This is a test email to verify that the TenderMatch Pro email configuration is working correctly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `;

    return await this.sendEmail(testEmail, subject, htmlContent);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;