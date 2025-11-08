/**
 * Admin Stock Fulfillment Email Template
 * 
 * Email template for notifying admins when vendors fulfill stock requests.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

export const generateAdminStockFulfillmentEmail = ({ adminEmail, vendorName, productTitle, quantityRequested, quantityFulfilled, requestId, status }) => {
  const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const adminPortalUrl = `${frontendUrl}/admin/product-requests/${requestId}`;
  const requestNumber = requestId.toString().slice(-8);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Request Fulfilled - Next Subscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #F6EFD2 0%, #E2DDB4 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #F6EFD2 0%, #E2DDB4 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border-radius: 24px; border: 1px solid rgba(228, 54, 54, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(246, 239, 210, 0.05) 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #4CAF50; font-family: 'Poppins', sans-serif;">
                ✅ Request Fulfilled
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
                Hello Admin,
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                <strong>${vendorName}</strong> has ${status === 'fulfilled' ? 'fully fulfilled' : 'partially fulfilled'} your stock request.
              </p>

              <div style="background: rgba(76, 175, 80, 0.05); border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1A1A1A;">
                  Request Details:
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Request ID:</strong> #${requestNumber}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Vendor:</strong> ${vendorName}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Product:</strong> ${productTitle}
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Requested:</strong> ${quantityRequested} unit(s)
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Fulfilled:</strong> ${quantityFulfilled} unit(s)
                </p>
                <p style="margin: 5px 0; font-size: 14px; color: #4A4A4A;">
                  <strong>Status:</strong> <span style="text-transform: capitalize;">${status.replace('_', ' ')}</span>
                </p>
              </div>

              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #4A4A4A;">
                Please review the uploaded credentials and approve or reject them as needed. You can decrypt and view the credentials in the admin portal.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${adminPortalUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #E43636 0%, #C62828 100%); color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(228, 54, 54, 0.3);">
                      Review Credentials
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(0, 0, 0, 0.02); border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated notification from Next Subscription Vendor Portal.
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

