/**
 * Admin Stock Request Email Template
 * 
 * Email template for notifying vendors about admin stock requests.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

export const generateAdminStockRequestEmail = ({ companyName, productTitle, quantityRequested, requestId, notes, deadline, adminEmail }) => {
  const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const vendorPortalUrl = `${frontendUrl}/vendor/requests`;
  const requestNumber = requestId.toString().slice(-8);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Request - Next Subscription</title>
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
                📦 Stock Request
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #4A4A4A;">
                Next Subscription Admin
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #1A1A1A; font-family: 'Poppins', sans-serif;">
                Hello ${companyName || 'Vendor'},
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                We need <strong>${quantityRequested} unit(s)</strong> of <strong>${productTitle}</strong> for Next Subscription.
              </p>

              <div style="background: rgba(228, 54, 54, 0.05); border-left: 4px solid #E43636; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1A1A1A;">
                  Request Details:
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Request ID:</strong> #${requestNumber}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Product:</strong> ${productTitle}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Quantity:</strong> ${quantityRequested} unit(s)
                </p>
                ${deadline ? `<p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;"><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>` : ''}
                ${notes ? `<p style="margin: 10px 0 0; font-size: 14px; color: #4A4A4A;"><strong>Notes:</strong> ${notes}</p>` : ''}
              </div>

              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                Please upload the account credentials to your vendor portal. You can access the request in the <strong>"Admin Requests"</strong> section.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${vendorPortalUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #E43636 0%, #C62828 100%); color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(228, 54, 54, 0.3);">
                      View Request & Upload Credentials
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you have any questions or concerns, please contact the admin at <a href="mailto:${adminEmail}" style="color: #E43636; text-decoration: none;">${adminEmail}</a>.
              </p>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Thank you for your prompt attention to this request.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(0, 0, 0, 0.02); border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated notification from Next Subscription Vendor Portal.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #999999;">
                Admin: ${adminEmail}
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

