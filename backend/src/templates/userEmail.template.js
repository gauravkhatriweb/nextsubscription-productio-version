/**
 * Email Templates - HTML Email Templates
 * 
 * Contains HTML email templates for various transactional emails:
 * - Welcome email (sent after registration)
 * - Verification OTP email (for account verification)
 * - Password reset OTP email (for password reset)
 * 
 * All templates use modern, responsive HTML design with inline CSS
 * for maximum email client compatibility. Styled with Next Subscription
 * brand colors and glass-effect aesthetic.
 * 
 * @author Gaurav Khatri
 * @version 2.0
 */

/**
 * Welcome Email Template
 * 
 * Generates HTML email template for welcoming new users after registration.
 * 
 * @param {string} firstname - User's first name
 * @returns {string} HTML email template string
 */
export const getUserWelcomeEmailHTML = (firstname) => {
    const safeName = firstname || "User";
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Next Subscription</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F6EFD2; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F6EFD2">
      <tr>
        <td align="center" style="padding: 40px 20px 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -100px; left: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(228, 54, 54, 0.12) 0%, rgba(246, 239, 210, 0.08) 50%, transparent 100%); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -120px; right: -120px; width: 240px; height: 240px; background: radial-gradient(circle, rgba(226, 221, 180, 0.10) 0%, rgba(228, 54, 54, 0.06) 50%, transparent 100%); border-radius: 50%; filter: blur(80px); pointer-events: none;"></div>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.15), 0 0 1px rgba(228, 54, 54, 0.1); position: relative; z-index: 1; border: 1px solid rgba(228, 54, 54, 0.08);">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 50%, #E43636 100%); text-align:center; padding:50px 40px 50px 40px; position: relative;">
                  <!-- Glassmorphism Logo Container -->
                  <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                    <div style="background: rgba(255,255,255,0.95); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">✨</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#F6EFD2; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:36px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.2); letter-spacing: -0.5px;">
                    Welcome to Next Subscription, ${safeName}!
                  </h1>
                  <p style="color:#F6EFD2; font-size:20px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    Seamless, Secure, and Beautiful Subscriptions.
                  </p>
                  
                  <!-- Decorative Elements -->
                  <div style="position: absolute; top: 20px; right: 30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"></div>
                  <div style="position: absolute; bottom: 30px; left: 40px; width: 40px; height: 40px; background: rgba(255,255,255,0.08); border-radius: 50%; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:28px; font-weight:600; color:#000000; margin:0 0 20px; letter-spacing: -0.3px;">
                      🎉 You're all set!
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#333333; margin:0; max-width: 500px; margin: 0 auto;">
                      Take control of your recurring payments with <strong style="color:#E43636; font-weight: 600;">intelligent tracking</strong>, automated reminders, and powerful insights — all in one elegant platform.
                    </p>
                  </div>

                  <!-- ENHANCED FEATURES GRID -->
                  <div style="margin: 40px 0 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:50%; padding-right:20px; vertical-align:top;">
                          <div style="background: linear-gradient(135deg, rgba(228, 54, 54, 0.06) 0%, rgba(246, 239, 210, 0.04) 100%); border-radius:20px; padding:28px 24px 28px 24px; text-align:center; border: 1px solid rgba(228, 54, 54, 0.1); position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                            <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(228, 54, 54, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                            <div style="font-size:40px; margin-bottom:16px; position: relative; z-index: 1;">📊</div>
                            <h3 style="font-size:20px; font-weight:600; color:#000000; margin:0 0 12px; font-family: 'Poppins', sans-serif;">Unified Dashboard</h3>
                            <p style="font-size:16px; color:#4A4A4A; margin:0; line-height:1.5;">Centralize all your subscriptions in one beautifully designed interface</p>
                          </div>
                        </td>
                        <td style="width:50%; padding-left:20px; vertical-align:top;">
                          <div style="background: linear-gradient(135deg, rgba(226, 221, 180, 0.06) 0%, rgba(246, 239, 210, 0.04) 100%); border-radius:20px; padding:28px 24px 28px 24px; text-align:center; border: 1px solid rgba(226, 221, 180, 0.2); position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                            <div style="position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(226, 221, 180, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                            <div style="font-size:40px; margin-bottom:16px; position: relative; z-index: 1;">🔔</div>
                            <h3 style="font-size:20px; font-weight:600; color:#000000; margin:0 0 12px; font-family: 'Poppins', sans-serif;">Smart Reminders</h3>
                            <p style="font-size:16px; color:#4A4A4A; margin:0; line-height:1.5;">Never miss a renewal with intelligent alerts tailored to your schedule</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- PREMIUM CTA BUTTON -->
                  <div style="text-align:center; margin:40px 0 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="https://nextsubscription.com" style="display:inline-block; background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 100%); color:#F6EFD2; text-decoration:none; padding:20px 40px; border-radius:50px; font-size:18px; font-weight:600; box-shadow: 0 12px 40px rgba(228, 54, 54, 0.3), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; font-family: 'Poppins', sans-serif;">
                            <span style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;">
                              🚀 Get Started
                            </span>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- ENHANCED BRAND MESSAGE -->
                  <div style="background: linear-gradient(135deg, rgba(246, 239, 210, 0.6) 0%, rgba(226, 221, 180, 0.4) 100%); border-radius:20px; padding:30px 32px 30px 32px; text-align:center; margin-top:40px; border: 1px solid rgba(228, 54, 54, 0.1); position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(228, 54, 54, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <p style="font-size:18px; color:#000000; margin:0 0 12px; font-style:italic; font-weight: 500;">
                        "Simplify how you manage your subscriptions — securely and beautifully."
                      </p>
                      <p style="font-size:14px; color:#4A4A4A; margin:0; font-weight: 500;">
                        — The Next Subscription Team
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #000000 0%, rgba(0, 0, 0, 0.95) 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Subtle decorative elements -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(228, 54, 54, 0.4) 20%, rgba(246, 239, 210, 0.3) 50%, rgba(226, 221, 180, 0.3) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#F6EFD2; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Next Subscription</h3>
                    <p style="color:#E2DDB4; font-size:16px; margin:0; font-weight: 500;">Seamless, Secure, and Beautiful Subscriptions</p>
                  </div>
                  
                  <div style="border-top:1px solid rgba(246, 239, 210, 0.2); padding-top:24px; margin-top:24px;">
                    <p style="color:#E2DDB4; font-size:14px; margin:0 0 16px; font-weight: 500; opacity: 0.8;">Made with ❤️ by the Next Subscription team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Website</a>
                      <span style="color:rgba(246, 239, 210, 0.4); font-size:14px;">•</span>
                      <a href="mailto:support@nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

/**
 * Verification OTP Email Template
 * 
 * Generates HTML email template for account verification OTP.
 * Displays the OTP code prominently with expiration information.
 * 
 * @param {string} otp - 6-digit verification code
 * @param {number} expiryMinutes - OTP expiration time in minutes
 * @returns {string} HTML email template string
 */
export const getUserVerifyOtpEmailHTML = (otp, expiryMinutes) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Next Subscription Account</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F6EFD2; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <span style="display:none!important; color:transparent; height:0; width:0; overflow:hidden; opacity:0;">Your Next Subscription verification code is ${otp}. It expires in ${expiryMinutes} minutes.</span>
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F6EFD2">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -80px; left: -80px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(228, 54, 54, 0.15) 0%, rgba(246, 239, 210, 0.10) 50%, transparent 100%); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -100px; right: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(226, 221, 180, 0.12) 0%, rgba(228, 54, 54, 0.08) 50%, transparent 100%); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
            
            <table width="100%" style="max-width:640px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.15), 0 0 1px rgba(228, 54, 54, 0.1); position: relative; z-index: 1; border: 1px solid rgba(228, 54, 54, 0.08);">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 50%, #E43636 100%); text-align:center; padding:60px 40px 50px; position: relative;">
                  <!-- Security Icon with Glassmorphism -->
                  <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.2);">
                    <div style="background: rgba(255,255,255,0.95); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">🔐</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#F6EFD2; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:32px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.2); letter-spacing: -0.3px;">
                    Verify Your Account
                  </h1>
                  <p style="color:#F6EFD2; font-size:18px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    Complete your Next Subscription registration with the code below.
                  </p>
                  
                  <!-- Floating Security Elements -->
                  <div style="position: absolute; top: 25px; right: 35px; width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);"></div>
                  <div style="position: absolute; bottom: 35px; left: 45px; width: 35px; height: 35px; background: rgba(255,255,255,0.08); border-radius: 50%; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:26px; font-weight:600; color:#000000; margin:0 0 20px; letter-spacing: -0.2px;">
                      ✨ Welcome to Next Subscription!
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#333333; margin:0; max-width: 480px; margin: 0 auto;">
                      Thanks for joining! Use the verification code below to activate your account and start managing your subscriptions.
                    </p>
                  </div>

                  <!-- PREMIUM OTP CODE SECTION -->
                  <div style="text-align:center; background: linear-gradient(135deg, rgba(228, 54, 54, 0.08) 0%, rgba(246, 239, 210, 0.06) 30%, rgba(226, 221, 180, 0.08) 70%, rgba(228, 54, 54, 0.06) 100%); border: 2px dashed rgba(228, 54, 54, 0.2); border-radius:24px; padding:40px; margin: 40px 0; position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <!-- Background Pattern -->
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(228, 54, 54, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -20px; left: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(226, 221, 180, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    
                    <div style="position: relative; z-index: 1;">
                      <div style="color:#4A4A4A; font-size:16px; margin-bottom:20px; font-weight:500; font-family: 'Poppins', sans-serif;">Your Verification Code</div>
                      
                      <!-- Premium OTP Display -->
                      <div style="background: linear-gradient(135deg, #FFFFFF 0%, rgba(246, 239, 210, 0.3) 100%); border-radius: 20px; padding: 24px; margin: 20px 0; box-shadow: 0 8px 32px rgba(228, 54, 54, 0.15), inset 0 1px 0 rgba(255,255,255,0.7); border: 1px solid rgba(228, 54, 54, 0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                        <div style="font-weight:700; font-family: 'Inter', 'SF Mono', Monaco, Consolas, monospace; color:#E43636; letter-spacing:12px; font-size:36px; margin:8px 0; text-shadow: 0 2px 4px rgba(228, 54, 54, 0.1);">
                          ${otp}
                        </div>
                      </div>
                      
                      <div style="color:#6B6B6B; font-size:15px; margin-top:20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 16px;">⏰</span>
                        <span>Code expires in <strong style="color:#000000; font-weight: 600;">${expiryMinutes} minutes</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- ENHANCED CTA BUTTON -->
                  <div style="text-align:center; margin:50px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://nextsubscription.com" style="display:inline-block; background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 100%); color:#F6EFD2; text-decoration:none; padding:18px 36px; border-radius:50px; font-size:16px; font-weight:600; box-shadow: 0 12px 40px rgba(228, 54, 54, 0.3), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; letter-spacing: 0.3px;">
                            🚀 Open Next Subscription
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- HELP SECTION -->
                  <div style="background: linear-gradient(135deg, rgba(246, 239, 210, 0.6) 0%, rgba(226, 221, 180, 0.4) 100%); border-radius:20px; padding:32px; text-align:center; margin-top:40px; border: 1px solid rgba(228, 54, 54, 0.1); position: relative; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(228, 54, 54, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px; font-family: 'Poppins', sans-serif;">Need Help?</h3>
                      <p style="font-size:16px; color:#333333; margin:0 0 12px; line-height: 1.6;">
                        Didn't request this verification? You can safely ignore this email.
                      </p>
                      <p style="font-size:15px; color:#4A4A4A; margin:0;">
                        Questions? Contact us at <a href="mailto:support@nextsubscription.com" style="color:#E43636; text-decoration:none; font-weight:600;">support@nextsubscription.com</a>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #000000 0%, rgba(0, 0, 0, 0.95) 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Brand gradient line -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(228, 54, 54, 0.5) 20%, rgba(246, 239, 210, 0.4) 50%, rgba(226, 221, 180, 0.4) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#F6EFD2; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Next Subscription</h3>
                    <p style="color:#E2DDB4; font-size:16px; margin:0; font-weight: 500;">Seamless, Secure, and Beautiful Subscriptions</p>
                  </div>
                  
                  <div style="border-top:1px solid rgba(246, 239, 210, 0.2); padding-top:24px; margin-top:24px;">
                    <p style="color:#E2DDB4; font-size:14px; margin:0 0 16px; font-weight: 500; opacity: 0.8;">Made with ❤️ by the Next Subscription team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Website</a>
                      <span style="color:rgba(246, 239, 210, 0.4); font-size:14px;">•</span>
                      <a href="mailto:support@nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

/**
 * Password Reset OTP Email Template
 * 
 * Generates HTML email template for password reset OTP.
 * Includes security notice and displays the OTP code prominently.
 * 
 * @param {string} otp - 6-digit password reset code
 * @param {number} expiryMinutes - OTP expiration time in minutes
 * @returns {string} HTML email template string
 */
export const getUserResetPasswordEmailHTML = (otp, expiryMinutes) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Next Subscription Password</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F6EFD2; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F6EFD2">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -60px; left: -60px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(228, 54, 54, 0.18) 0%, rgba(246, 239, 210, 0.12) 50%, transparent 100%); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -80px; right: -80px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(226, 221, 180, 0.15) 0%, rgba(228, 54, 54, 0.10) 50%, transparent 100%); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>
            
            <table width="100%" style="max-width:640px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.15), 0 0 1px rgba(228, 54, 54, 0.1); position: relative; z-index: 1; border: 1px solid rgba(228, 54, 54, 0.08);">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 50%, #E43636 100%); text-align:center; padding:60px 40px 50px; position: relative;">
                  <!-- Security Lock Icon -->
                  <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.2);">
                    <div style="background: rgba(255,255,255,0.95); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">🔒</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#F6EFD2; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:32px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.25); letter-spacing: -0.3px;">
                    Password Reset Request
                  </h1>
                  <p style="color:#F6EFD2; font-size:18px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    We received a request to reset your Next Subscription account password.
                  </p>
                  
                  <!-- Security Alert Elements -->
                  <div style="position: absolute; top: 30px; right: 40px; width: 45px; height: 45px; background: rgba(255,255,255,0.12); border-radius: 50%; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);"></div>
                  <div style="position: absolute; bottom: 40px; left: 50px; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:26px; font-weight:600; color:#000000; margin:0 0 20px; letter-spacing: -0.2px;">
                      🔐 Reset Your Password
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#333333; margin:0; max-width: 480px; margin: 0 auto;">
                      Use the verification code below to reset your password and regain secure access to your account.
                    </p>
                  </div>

                  <!-- PREMIUM OTP CODE SECTION -->
                  <div style="text-align:center; background: linear-gradient(135deg, rgba(228, 54, 54, 0.08) 0%, rgba(246, 239, 210, 0.06) 25%, rgba(226, 221, 180, 0.08) 50%, rgba(228, 54, 54, 0.06) 75%, rgba(246, 239, 210, 0.08) 100%); border: 2px dashed rgba(228, 54, 54, 0.25); border-radius:24px; padding:40px; margin: 40px 0; position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <!-- Warning Pattern -->
                    <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(228, 54, 54, 0.06) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -15px; left: -15px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(226, 221, 180, 0.06) 0%, transparent 70%); border-radius: 50%;"></div>
                    
                    <div style="position: relative; z-index: 1;">
                      <div style="color:#4A4A4A; font-size:16px; margin-bottom:20px; font-weight:500; font-family: 'Poppins', sans-serif;">Your Password Reset Code</div>
                      
                      <!-- Premium OTP Display -->
                      <div style="background: linear-gradient(135deg, #FFFFFF 0%, rgba(246, 239, 210, 0.4) 100%); border-radius: 20px; padding: 24px; margin: 20px 0; box-shadow: 0 8px 32px rgba(228, 54, 54, 0.15), inset 0 1px 0 rgba(255,255,255,0.7); border: 1px solid rgba(228, 54, 54, 0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                        <div style="font-weight:700; font-family: 'Inter', 'SF Mono', Monaco, Consolas, monospace; color:#E43636; letter-spacing:12px; font-size:36px; margin:8px 0; text-shadow: 0 2px 4px rgba(228, 54, 54, 0.1);">
                          ${otp}
                        </div>
                      </div>
                      
                      <div style="color:#6B6B6B; font-size:15px; margin-top:20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 16px;">⏰</span>
                        <span>Code expires in <strong style="color:#000000; font-weight: 600;">${expiryMinutes} minutes</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- ENHANCED CTA BUTTON -->
                  <div style="text-align:center; margin:50px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://nextsubscription.com" style="display:inline-block; background: linear-gradient(135deg, #E43636 0%, rgba(228, 54, 54, 0.9) 100%); color:#F6EFD2; text-decoration:none; padding:18px 36px; border-radius:50px; font-size:16px; font-weight:600; box-shadow: 0 12px 40px rgba(228, 54, 54, 0.3), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; letter-spacing: 0.3px;">
                            🔑 Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- SECURITY NOTICE -->
                  <div style="background: linear-gradient(135deg, rgba(228, 54, 54, 0.08) 0%, rgba(246, 239, 210, 0.06) 100%); border-left: 4px solid #E43636; border-radius:20px; padding:24px; margin:40px 0; position: relative; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(228, 54, 54, 0.06) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="color:#E43636; font-size:18px; font-weight:600; margin:0 0 12px; font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 8px;">
                        🛡️ Security Notice
                      </h3>
                      <p style="color:#000000; font-size:16px; margin:0; line-height:1.6; font-weight: 500;">
                        If you didn't request this password reset, please ignore this email or contact our support team immediately at <a href="mailto:support@nextsubscription.com" style="color:#E43636; text-decoration:none; font-weight:600;">support@nextsubscription.com</a>.
                      </p>
                    </div>
                  </div>

                  <!-- HELP SECTION -->
                  <div style="background: linear-gradient(135deg, rgba(246, 239, 210, 0.6) 0%, rgba(226, 221, 180, 0.4) 100%); border-radius:20px; padding:32px; text-align:center; margin-top:40px; border: 1px solid rgba(228, 54, 54, 0.1); position: relative; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
                    <div style="position: absolute; top: -15px; left: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(228, 54, 54, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px; font-family: 'Poppins', sans-serif;">Need Help?</h3>
                      <p style="font-size:15px; color:#4A4A4A; margin:0;">
                        Contact us at <a href="mailto:support@nextsubscription.com" style="color:#E43636; text-decoration:none; font-weight:600;">support@nextsubscription.com</a>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #000000 0%, rgba(0, 0, 0, 0.95) 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Brand gradient line -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(228, 54, 54, 0.5) 20%, rgba(246, 239, 210, 0.4) 50%, rgba(226, 221, 180, 0.4) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#F6EFD2; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Next Subscription</h3>
                    <p style="color:#E2DDB4; font-size:16px; margin:0; font-weight: 500;">Seamless, Secure, and Beautiful Subscriptions</p>
                  </div>
                  
                  <div style="border-top:1px solid rgba(246, 239, 210, 0.2); padding-top:24px; margin-top:24px;">
                    <p style="color:#E2DDB4; font-size:14px; margin:0 0 16px; font-weight: 500; opacity: 0.8;">Made with ❤️ by the Next Subscription team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Website</a>
                      <span style="color:rgba(246, 239, 210, 0.4); font-size:14px;">•</span>
                      <a href="mailto:support@nextsubscription.com" style="color:#F6EFD2; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(228, 54, 54, 0.2); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

export default {
    getUserWelcomeEmailHTML,
    getUserVerifyOtpEmailHTML,
    getUserResetPasswordEmailHTML,
};
