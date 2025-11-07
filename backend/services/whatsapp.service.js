/**
 * WhatsApp Service
 * 
 * Generates WhatsApp message links for vendor credentials and notifications.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

/**
 * Generate WhatsApp message URL
 * 
 * @param {string} phoneNumber - Phone number with country code (e.g., +1234567890)
 * @param {string} message - Message text
 * @returns {string} WhatsApp URL
 */
export const generateWhatsAppUrl = (phoneNumber, message) => {
  // Remove any non-digit characters except +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Generate vendor credentials WhatsApp message
 */
export const generateVendorCredentialsWhatsApp = ({ companyName, email, password, loginUrl }) => {
  return `Hello ${companyName || 'Vendor'},

Welcome to Next Subscription! 🎉

Your vendor account has been created. Here are your login credentials:

📧 Email: ${email}
🔑 Password: ${password}

🔗 Login Link: ${loginUrl}

📋 NEXT STEPS:
1. Click the login link above or visit ${loginUrl}
2. Login with your email and password
3. ⚠️ You MUST change your password on first login
4. Complete your vendor profile form
5. Submit your application for review

⏳ REVIEW PROCESS:
• Your application will be reviewed by our admin team
• Once approved ✅ → You can start submitting products
• If rejected ❌ → You'll receive a notification with details

Thank you for joining Next Subscription!`;
};

/**
 * Generate vendor rejection WhatsApp message
 */
export const generateVendorRejectionWhatsApp = ({ companyName, reason }) => {
  return `Hello ${companyName || 'Vendor'},

We regret to inform you that your vendor application has been reviewed and unfortunately, we cannot proceed with your account at this time.

${reason ? `Reason: ${reason}` : 'Please contact our support team for more information.'}

If you have any questions, please reach out to our support team.

Thank you for your interest in Next Subscription.`;
};

