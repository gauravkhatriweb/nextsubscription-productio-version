/**
 * Admin Email Template
 * 
 * HTML email template for admin one-time access codes.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

/**
 * Generate HTML email template for admin access code
 * 
 * @param {string} code - Plain text admin access code
 * @param {Date} expiresAt - Code expiration timestamp
 * @returns {string} HTML email content
 */
export const getAdminCodeEmailHTML = (code, expiresAt) => {
  const expiryMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
  const expiryTime = expiresAt.toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Access Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Admin Access Code Request</h1>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello Gaurav,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                A request was received to sign in to the Next Subscription admin portal.
              </p>
              
              <div style="background-color: #f8f9fa; border: 2px solid #E43636; border-radius: 6px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #6b6b6b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Your One-Time Admin Access Code</p>
                <p style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px; word-break: break-all;">
                  ${code}
                </p>
              </div>
              
              <p style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 14px; line-height: 1.5;">
                <strong>This code is valid for ${expiryMinutes} minutes</strong> (until ${expiryTime} UTC) and can be used only once.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #6b6b6b; font-size: 14px; line-height: 1.5;">
                The code includes letters (upper and lower case), numbers, and special characters. Please copy it exactly as shown.
              </p>
              
              <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0 0 10px 0; color: #ef4444; font-size: 13px; line-height: 1.5;">
                  <strong>⚠️ Security Notice:</strong> If you did not request this code, please contact the site owner immediately. Unauthorized access attempts are logged and monitored.
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #6b6b6b; font-size: 12px; line-height: 1.5;">
                — Next Subscription Security Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

