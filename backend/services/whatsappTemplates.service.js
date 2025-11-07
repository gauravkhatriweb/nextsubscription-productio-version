/**
 * WhatsApp Message Templates Service
 * 
 * Provides predefined WhatsApp message templates for admin use.
 * Templates are copy-paste ready and can be customized with vendor data.
 * 
 * @author Gaurav Khatri
 * @version 2.2
 */

const ADMIN_EMAIL = 'gauravkhatriweb@gmail.com';
const ADMIN_NAME = 'Gaurav Khatri';
const FRONTEND_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const VENDOR_LOGIN_URL = `${FRONTEND_URL}/vendor/login`;

/**
 * Generate Welcome/Activation Message Template
 */
export const getWelcomeTemplate = ({ vendorName, vendorEmail, vendorPassword }) => {
  return `Hello ${vendorName || 'Vendor'},

We are happy to inform you that your vendor account has been ACTIVATED on Next Subscription.

You can log in at: ${VENDOR_LOGIN_URL}
Email: ${vendorEmail}
Password: ${vendorPassword}

Please follow these steps to complete setup:
1. Log in with the credentials above.
2. Complete your business details and upload your logo.
3. Start adding your products and plans.

Regards,  
Next Subscription Admin  
${ADMIN_NAME}  
📧 ${ADMIN_EMAIL}`;
};

/**
 * Generate Pending Status Notification Template
 */
export const getPendingTemplate = ({ vendorName }) => {
  return `Hello ${vendorName || 'Vendor'},

Your account status is currently PENDING.  
Please contact the admin (${ADMIN_NAME}, 📧 ${ADMIN_EMAIL}) for verification or additional details.`;
};

/**
 * Generate Suspended Vendor Notification Template
 */
export const getSuspendedTemplate = ({ vendorName }) => {
  return `Hello ${vendorName || 'Vendor'},

Your account has been SUSPENDED due to policy violation or incomplete details.  
Please contact ${ADMIN_NAME} at 📧 ${ADMIN_EMAIL} for resolution.`;
};

/**
 * Generate Rejected Vendor Notification Template
 */
export const getRejectedTemplate = ({ vendorName }) => {
  return `Hello ${vendorName || 'Vendor'},

Your vendor account has been REJECTED.  
For clarification or appeal, contact ${ADMIN_NAME} (📧 ${ADMIN_EMAIL}).

Thank you for your interest in partnering with Next Subscription.`;
};

/**
 * Get all available templates
 */
export const getAllTemplates = () => {
  return [
    {
      id: 'welcome',
      name: 'Welcome / Account Activation',
      description: 'Send when vendor account is activated',
      generate: getWelcomeTemplate
    },
    {
      id: 'pending',
      name: 'Pending Status Notification',
      description: 'Send when vendor account is pending review',
      generate: getPendingTemplate
    },
    {
      id: 'suspended',
      name: 'Suspended Vendor Notification',
      description: 'Send when vendor account is suspended',
      generate: getSuspendedTemplate
    },
    {
      id: 'rejected',
      name: 'Rejected Vendor Notification',
      description: 'Send when vendor account is rejected',
      generate: getRejectedTemplate
    }
  ];
};

/**
 * Generate template message with vendor data
 */
export const generateTemplateMessage = (templateId, vendorData) => {
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  
  return template.generate(vendorData);
};

