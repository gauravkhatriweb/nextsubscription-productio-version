/**
 * Vendor Email Template
 * 
 * Professional email template for vendor credentials delivery.
 * Uses Next Subscription branding and glass-effect styling.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

export const generateVendorCredentialsEmail = ({ companyName, email, password, loginUrl, isReset = false }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Access Credentials</title>
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
                Vendor Portal Access
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #1A1A1A; font-family: 'Poppins', sans-serif;">
                ${isReset ? 'Password Reset' : 'Welcome to Next Subscription'}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                ${isReset ? 'Your password has been reset.' : `Hello ${companyName || 'Vendor'},`}
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                ${isReset 
                  ? 'Your vendor account credentials have been updated. Please use the new password below to access your vendor portal.'
                  : 'Your vendor account has been created. You can now access the vendor portal using the credentials below. Please complete your vendor profile form, and your application will be reviewed by our admin team. Once approved, you can start submitting products.'
                }
              </p>
              
              <!-- Credentials Box -->
              <div style="background: rgba(228, 54, 54, 0.05); border: 2px solid rgba(228, 54, 54, 0.2); border-radius: 12px; padding: 24px; margin: 30px 0;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1A1A1A;">Email:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #4A4A4A; font-family: 'Courier New', monospace;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1A1A1A;">Temporary Password:</td>
                    <td style="padding: 8px 0; font-size: 16px; color: #E43636; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 1px;">${password}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Important Notice -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #92400E;">
                  <strong>⚠️ Important:</strong> You must change your password on your first login. This temporary password is for initial access only.
                </p>
                ${!isReset ? `
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400E;">
                  <strong>📋 Next Steps:</strong> Complete your vendor profile form. Your application will be reviewed by our admin team. Once approved, you can start submitting products.
                </p>
                ` : ''}
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #E43636 0%, #C92A2A 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(228, 54, 54, 0.3);">
                      Access Vendor Portal →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                If you have any questions or need assistance, please contact our support team.
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


