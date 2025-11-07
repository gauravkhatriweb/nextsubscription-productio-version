# Admin Settings API Documentation

## Overview

The Admin Settings API allows administrators to manage site-wide configuration including branding (logo, favicon, site name), content (headlines, taglines), and theme colors. All settings are persisted in MongoDB and include audit logging.

## Endpoints

### Public Endpoints

#### GET /api/admin/settings
Get current site settings (public endpoint for theme loading).

**Response:**
```json
{
  "success": true,
  "settings": {
    "siteName": "Next Subscription",
    "logoUrl": "/uploads/branding/logo/logo_1234567890_logo.png",
    "faviconUrl": "/uploads/branding/favicon/favicon_1234567890.ico",
    "heroHeadline": "Simplify how you manage your subscriptions...",
    "heroTagline": "Take control of your recurring payments...",
    "primaryHeading": "For Subscribers",
    "theme": {
      "primary": "#E43636",
      "background": "#F6EFD2",
      "surface": "#E2DDB4",
      "text": "#000000"
    },
    "settingsVersion": 1
  }
}
```

### Protected Admin Endpoints

All protected endpoints require admin authentication via `verifyAdminJWT` middleware.

#### PUT /api/admin/settings/branding
Update branding settings (logo, favicon, site name).

**Request:**
- Method: `PUT`
- Content-Type: `multipart/form-data`
- Body:
  - `logo` (file, optional): Logo image (PNG, JPG, SVG, max 2MB)
  - `favicon` (file, optional): Favicon (ICO, PNG, max 500KB)
  - `siteName` (string, optional): Site name

**Response:**
```json
{
  "success": true,
  "message": "Branding settings updated successfully",
  "settings": {
    "siteName": "Next Subscription",
    "logoUrl": "/uploads/branding/logo/logo_1234567890_logo.png",
    "faviconUrl": "/uploads/branding/favicon/favicon_1234567890.ico"
  }
}
```

#### PUT /api/admin/settings/content
Update content settings (headlines, taglines).

**Request:**
- Method: `PUT`
- Content-Type: `application/json`
- Body:
```json
{
  "heroHeadline": "Your headline here",
  "heroTagline": "Your tagline here",
  "primaryHeading": "Your heading here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content settings updated successfully",
  "settings": {
    "heroHeadline": "Your headline here",
    "heroTagline": "Your tagline here",
    "primaryHeading": "Your heading here"
  }
}
```

#### PUT /api/admin/settings/theme
Update theme colors.

**Request:**
- Method: `PUT`
- Content-Type: `application/json`
- Body:
```json
{
  "primary": "#E43636",
  "background": "#F6EFD2",
  "surface": "#E2DDB4",
  "text": "#000000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Theme settings updated successfully",
  "settings": {
    "theme": {
      "primary": "#E43636",
      "background": "#F6EFD2",
      "surface": "#E2DDB4",
      "text": "#000000"
    }
  }
}
```

**Validation:**
- Colors must be valid hex format (e.g., `#E43636`)
- Background and text colors are validated for contrast (WCAG AA requires 4.5:1 ratio)

#### POST /api/admin/settings/theme/reset
Reset theme to brand defaults.

**Request:**
- Method: `POST`
- Body: Empty

**Response:**
```json
{
  "success": true,
  "message": "Theme reset to brand defaults",
  "settings": {
    "theme": {
      "primary": "#E43636",
      "background": "#F6EFD2",
      "surface": "#E2DDB4",
      "text": "#000000"
    }
  }
}
```

## File Upload Specifications

### Logo
- **Formats:** PNG, JPG, JPEG, SVG
- **Max Size:** 2MB
- **Storage:** `/uploads/branding/logo/`
- **Naming:** `logo_{timestamp}_{originalName}.{ext}`

### Favicon
- **Formats:** ICO, PNG
- **Max Size:** 500KB
- **Recommended Size:** 32x32 or 48x48 pixels
- **Storage:** `/uploads/branding/favicon/`
- **Naming:** `favicon_{timestamp}.{ext}`

## Audit Logging

All settings changes are logged in the `changeHistory` array with:
- `changedBy`: Admin email
- `changedAt`: Timestamp
- `changes`: Object with old/new values
- `changeType`: 'branding', 'content', or 'theme'

The system keeps the last 50 changes for audit purposes.

## Backup System

When logo or favicon files are replaced:
1. Old file is copied to `/uploads/branding/backups/`
2. New file is saved
3. Old file is deleted

This allows for rollback if needed.

## Environment Variables

No additional environment variables required. Uses existing:
- `JWT_SECRET`: For admin authentication
- `MONGODB_URI`: For database connection

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid admin token)
- `403`: Forbidden (not admin user)
- `500`: Internal Server Error

## Frontend Integration

### Loading Theme on App Startup

The frontend should fetch settings on app load and apply theme:

```javascript
// In main.jsx or App.jsx
useEffect(() => {
  const loadTheme = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      if (response.data.success) {
        const theme = response.data.settings.theme;
        // Apply to CSS variables
        document.documentElement.style.setProperty('--brand-primary', theme.primary);
        document.documentElement.style.setProperty('--bg-light', theme.background);
        // ... etc
      }
    } catch (error) {
      // Use defaults
    }
  };
  loadTheme();
}, []);
```

### Updating Favicon

When favicon is updated, the frontend should update the `<link rel="icon">` tag:

```javascript
const updateFavicon = (url) => {
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
};
```

## Database Schema

The Settings model uses a single-row pattern (only one settings document exists):

```javascript
{
  siteName: String,
  logoUrl: String,
  faviconUrl: String,
  heroHeadline: String,
  heroTagline: String,
  primaryHeading: String,
  theme: {
    primary: String,
    background: String,
    surface: String,
    text: String
  },
  settingsVersion: Number,
  updatedBy: String, // Admin email
  changeHistory: [{
    changedBy: String,
    changedAt: Date,
    changes: Mixed,
    changeType: String
  }]
}
```

## Security Considerations

1. **Admin Authentication:** All write endpoints require admin JWT token
2. **File Validation:** Uploads are validated for type and size
3. **Rate Limiting:** Consider adding rate limiting for settings updates
4. **CSRF Protection:** Ensure CSRF tokens if using cookie-based auth
5. **File Storage:** Consider using S3 or similar for production

## Testing

### Manual Test Checklist

- [ ] Upload logo (PNG, JPG, SVG)
- [ ] Upload favicon (ICO, PNG)
- [ ] Update site name
- [ ] Update hero headline/tagline
- [ ] Update theme colors
- [ ] Reset theme to defaults
- [ ] Verify contrast validation
- [ ] Check audit log entries
- [ ] Verify file backups
- [ ] Test error handling (invalid files, missing auth)

### Example cURL Commands

```bash
# Get settings
curl http://localhost:3000/api/admin/settings

# Update branding (with auth cookie)
curl -X PUT http://localhost:3000/api/admin/settings/branding \
  -H "Cookie: adminToken=YOUR_TOKEN" \
  -F "logo=@logo.png" \
  -F "siteName=My Site"

# Update theme
curl -X PUT http://localhost:3000/api/admin/settings/theme \
  -H "Cookie: adminToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primary":"#E43636","background":"#F6EFD2","surface":"#E2DDB4","text":"#000000"}'
```

## Migration Notes

If adding the Settings model to an existing database:

1. The model will auto-create the first settings document on first access
2. Default values are provided in the schema
3. No migration script needed - the singleton pattern handles initialization

