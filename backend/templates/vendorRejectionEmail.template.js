/**
 * Vendor Rejection Email Template
 * 
 * Professional email template for vendor rejection notifications.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

export const generateVendorRejectionEmail = ({ companyName, reason }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Application Update</title>
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
                Vendor Application Update
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #1A1A1A; font-family: 'Poppins', sans-serif;">
                Application Review Update
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                Hello ${companyName || 'Vendor'},
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                Thank you for your interest in becoming a vendor on Next Subscription. After careful review of your application, we regret to inform you that we cannot proceed with your vendor account at this time.
              </p>
              
              ${reason ? `
              <!-- Reason Box -->
              <div style="background: rgba(239, 68, 68, 0.05); border-left: 4px solid #EF4444; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400E;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
              ` : ''}
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                If you have any questions or would like to discuss this decision further, please contact our support team.
              </p>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                We appreciate your interest and wish you the best in your future endeavors.
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
</html>
  `;
};

