/**
 * Vendor Status Change Email Template
 * 
 * Email template for notifying vendors about account status changes.
 * 
 * @author Gaurav Khatri
 * @version 2.2
 */

export const generateVendorStatusChangeEmail = ({ companyName, status, reason }) => {
  const statusMessages = {
    active: {
      title: 'Account Activated',
      message: 'Your vendor account has been ACTIVATED. You can now access your dashboard and start managing your products.',
      action: 'Log in to your vendor portal to get started.'
    },
    pending: {
      title: 'Account Under Review',
      message: 'Your vendor account is currently PENDING review. Our admin team will review your application shortly.',
      action: 'Please contact the admin at 📧 gauravkhatriweb@gmail.com for verification or additional details.'
    },
    suspended: {
      title: 'Account Suspended',
      message: 'Your vendor account has been SUSPENDED due to policy violation or incomplete details.',
      action: 'Please contact Gaurav Khatri at 📧 gauravkhatriweb@gmail.com for resolution.'
    },
    rejected: {
      title: 'Account Rejected',
      message: reason 
        ? `Your vendor account has been REJECTED. Reason: ${reason}`
        : 'Your vendor account has been REJECTED.',
      action: 'For clarification or appeal, contact Gaurav Khatri (📧 gauravkhatriweb@gmail.com).'
    }
  };

  const statusInfo = statusMessages[status] || statusMessages.pending;
  const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const vendorLoginUrl = `${frontendUrl}/vendor/login`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #F6EFD2 0%, #E2DDB4 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #F6EFD2 0%, #E2DDB4 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(228, 54, 54, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(228, 54, 54, 0.1) 0%, rgba(246, 239, 210, 0.05) 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #E43636; font-family: 'Poppins', sans-serif;">
                Next Subscription
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #4A4A4A;">
                Vendor Portal
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #1A1A1A; font-family: 'Poppins', sans-serif;">
                ${statusInfo.title}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                Hello ${companyName || 'Vendor'},
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                ${statusInfo.message}
              </p>
              
              ${status === 'active' ? `
              <!-- CTA Button for Active Status -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${vendorLoginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #E43636 0%, #C92A2A 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(228, 54, 54, 0.3);">
                      Access Vendor Portal →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Action Notice -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400E;">
                  <strong>📋 Next Steps:</strong> ${statusInfo.action}
                </p>
              </div>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                If you have any questions or need assistance, please contact our support team at 📧 gauravkhatriweb@gmail.com
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(0, 0, 0, 0.02); border-top: 1px solid rgba(228, 54, 54, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #6B6B6B;">
                © ${new Date().getFullYear()} Next Subscription. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9A9A9A;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

