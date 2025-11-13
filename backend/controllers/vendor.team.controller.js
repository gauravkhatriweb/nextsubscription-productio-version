/**
 * Vendor Team Controller
 * 
 * Handles team member management for vendor.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import VendorTeamModel from '../models/vendorTeam.model.js';
import { sendEmail } from '../services/email.service.js';
import { generateVendorCredentialsEmail } from '../templates/vendorEmail.template.js';

// Generate secure password (same as vendor service)
const generateSecurePassword = () => {
  const vowels = 'aeiou';
  
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const digits = '0123456789';
  
  let password = '';
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 chars
  
  for (let i = 0; i < length; i++) {
    if (i % 3 === 2 && Math.random() > 0.3) {
      password += digits[Math.floor(Math.random() * digits.length)];
    } else if (i % 2 === 0) {
      password += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      password += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  
  if (!/\d/.test(password)) {
    const randomPos = Math.floor(Math.random() * password.length);
    password = password.slice(0, randomPos) + 
               digits[Math.floor(Math.random() * digits.length)] + 
               password.slice(randomPos + 1);
  }
  
  return password.charAt(0).toUpperCase() + password.slice(1);
};

/**
 * Get Team Members
 * 
 * @route GET /api/vendor/team
 */
export const getTeamMembers = async (req, res) => {
  try {
    const team = await VendorTeamModel.find({ vendorId: req.vendor._id })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      team
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
};

/**
 * Create Team Member
 * 
 * @route POST /api/vendor/team
 */
export const createTeamMember = async (req, res) => {
  try {
    const { email, role, displayName, permissions } = req.body;

    // Check if email already exists
    const existing = await VendorTeamModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Team member with this email already exists'
      });
    }

    // Generate password
    const temporaryPassword = generateSecurePassword();
    const passwordHash = await VendorTeamModel.hashPassword(temporaryPassword);

    // Set permissions based on role
    const defaultPermissions = {
      loader: { canAddStock: true, canViewOrders: false },
      support: { canViewOrders: true, canFulfillOrders: true },
      manager: {
        canAddStock: true,
        canViewOrders: true,
        canFulfillOrders: true,
        canManageProducts: true,
        canManageTeam: true,
        canViewReports: true
      }
    };

    const teamMember = new VendorTeamModel({
      vendorId: req.vendor._id,
      email: email.toLowerCase(),
      role: role || 'loader',
      displayName,
      passwordHash,
      permissions: permissions || defaultPermissions[role] || {},
      createdBy: req.vendor._id
    });

    await teamMember.save();

    // Send credentials email
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const emailHtml = generateVendorCredentialsEmail({
      companyName: req.vendor.companyName || req.vendor.displayName,
      email: teamMember.email,
      password: temporaryPassword,
      loginUrl: `${frontendUrl}/vendor/login`
    });

    await sendEmail(
      teamMember.email,
      'Next Subscription — Team Member Access',
      emailHtml

      
    );

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      teamMember: await VendorTeamModel.findById(teamMember._id).select('-passwordHash'),
      temporaryPassword // Return for admin reference
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create team member'
    });
  }
};

/**
 * Update Team Member
 * 
 * @route PUT /api/vendor/team/:id
 */
export const updateTeamMember = async (req, res) => {
  try {
    const teamMember = await VendorTeamModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    Object.assign(teamMember, req.body);
    await teamMember.save();

    return res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      teamMember: await VendorTeamModel.findById(teamMember._id).select('-passwordHash')
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update team member'
    });
  }
};

/**
 * Delete Team Member
 * 
 * @route DELETE /api/vendor/team/:id
 */
export const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await VendorTeamModel.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete team member'
    });
  }
};

