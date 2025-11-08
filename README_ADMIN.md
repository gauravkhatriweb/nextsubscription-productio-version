Next Subscription — Admin Panel Final Refinement v3.5
====================================================

Overview
— Clean, secure Admin for Vendors, Settings, and Monitoring. This release finalizes password visibility for vendors, consolidates communications, and upgrades Settings (Branding, Content, Theme, Preview).

Navigation Hierarchy
- Dashboard
- Settings
  - Branding
  - Content
  - Theme
  - Preview
- System Monitoring
- Vendors

Vendor Password Visibility (Admin-only)
- Vendor Management Table: Each row shows a masked password with an eye toggle (👁️/🙈). Click the password to copy; a “Password copied!” toast confirms.
- Vendor Detail Page: Password is displayed in a glass-effect box with show/hide and copy.
- Security: Passwords are never returned in vendor/public endpoints. Admin endpoints enrich records by decrypting `adminPasswordEncrypted` or back-filling from audit logs. Access is guarded by admin JWT.

WhatsApp Templates
- Use the 💬 button in the Vendors table or Vendor Detail to open copy-ready WhatsApp templates. There is no live integration; copy-paste is manual by design.
- The global “Communication Toolkit” is available inside Vendor Management.

Settings
Branding
- Upload: Logo (PNG/JPG/SVG, ≤2MB), Favicon (ICO/PNG, ≤500KB). Replace, delete, and instant preview supported.
- Favicon updates the <head> after publish. Site name updates page title after publish.

Content
- Simplified fields: hero headline, hero tagline, primary heading. Better spacing and live preview via the Preview tab.
- After updating, you’ll see “✅ Changes saved successfully” to confirm.

Theme
- Advanced dual palettes: Light and Dark.
- Editable colors: Primary, Secondary, Background, Surface, Text, Button, Accent.
- “Preview Mode” toggle to switch between Light/Dark in real time.
- No color restrictions; full creative freedom.

Preview
- Combined preview for Branding, Content, and Theme.
- “🚀 Publish to Live Website” applies all pending changes. Live CSS variables and favicon/title update immediately.

Operational Notes
- Audit: vendor password generation/reset, settings changes tracked in settings changeHistory.
- Rate Limiting & Auth: Admin endpoints require admin JWT.

Troubleshooting
- Password not visible: ensure ENCRYPTION_KEY (≥32 chars) is set. Legacy vendors are back-filled from audit logs on first view.
- Upload errors: verify file sizes and formats.

Credits
By Gaurav Khatri

