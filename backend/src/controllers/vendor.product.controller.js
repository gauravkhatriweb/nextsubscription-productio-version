/**
 * Vendor Product Controller
 * 
 * Handles product CRUD operations for vendor.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import ProductModel from '../models/product.model.js';
import crypto from 'crypto';

// Encryption for account credentials
// CRITICAL: ENCRYPTION_KEY must be set in environment variables (32+ characters)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable must be set and at least 32 characters long');
  }
  return Buffer.from(key, 'utf8');
};

const encrypt = (text) => {
  if (!text) return null;
  try {
    const algorithm = 'aes-256-cbc';
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
};

const decrypt = (text) => {
  if (!text) return null;
  try {
    const algorithm = 'aes-256-cbc';
    const key = getEncryptionKey();
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Get Products List
 * 
 * @route GET /api/vendor/products
 */
export const getProducts = async (req, res) => {
  try {
    const { status, provider, limit = 50, page = 1 } = req.query;
    const query = { vendorId: req.vendor._id };

    if (status) query.status = status;
    if (provider) query.provider = provider;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await ProductModel.find(query)
      .select('-accountPassword') // Don't send password
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProductModel.countDocuments(query);
    const active = await ProductModel.countDocuments({ ...query, status: 'active' });

    return res.status(200).json({
      success: true,
      products,
      total,
      active,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * Get Product by ID
 * 
 * @route GET /api/vendor/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    }).select('-accountPassword');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Create Product
 * 
 * @route POST /api/vendor/products
 */
export const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      vendorId: req.vendor._id
    };

    // Encrypt account credentials if provided
    if (productData.accountPassword) {
      productData.accountPassword = encrypt(productData.accountPassword);
    }

    // Set default status based on admin review requirement
    if (!productData.status) {
      productData.status = 'pending'; // Requires admin approval
    }

    const product = new ProductModel(productData);
    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: await ProductModel.findById(product._id).select('-accountPassword')
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

/**
 * Update Product
 * 
 * @route PUT /api/vendor/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Encrypt password if provided
    if (req.body.accountPassword) {
      req.body.accountPassword = encrypt(req.body.accountPassword);
    }

    Object.assign(product, req.body);
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: await ProductModel.findById(product._id).select('-accountPassword')
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
};

/**
 * Delete Product
 * 
 * @route DELETE /api/vendor/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * Upload Account Credentials (Bulk)
 * 
 * @route POST /api/vendor/products/:id/upload-accounts
 */
export const uploadAccounts = async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.serviceType !== 'account_share') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for account_share products'
      });
    }

    const { accounts, profiles } = req.body;

    // Handle account-level credentials
    if (accounts && accounts.length > 0) {
      const account = accounts[0]; // Use first account
      if (account.email && account.password) {
        product.accountEmail = account.email;
        product.accountPassword = encrypt(account.password);
      }
    }

    // Handle profiles
    if (profiles && profiles.length > 0) {
      product.profiles = profiles.map(p => ({
        profileName: p.profileName,
        pin: p.pin || null,
        isAssigned: false
      }));
      product.stock = profiles.length;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Accounts uploaded successfully',
      product: await ProductModel.findById(product._id).select('-accountPassword')
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload accounts'
    });
  }
};

