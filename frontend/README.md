# Next Subscription — Frontend

**Version:** 1.1  
**Author:** Gaurav Khatri  
**Last Updated:** 2025

**Frontend Version:** 1.1 — Visual Refresh
**Author:** Gaurav Khatri

---

## 📋 Description

This is the frontend application for **Next Subscription**, a modern subscription management platform built with React. The frontend provides a responsive, user-friendly interface for managing subscriptions, customer accounts, and platform features.

The application uses React 19 with Vite for fast development and optimized builds, Tailwind CSS for styling, and React Router for client-side navigation. Authentication and state management are handled through React Context API.

---

## 🗂️ Folder Structure

```
frontend/
├── public/                  # Static assets
│   ├── favicon.ico         # Application favicon
│   ├── nextsubscription_main_logo.png  # Brand logo
│   └── sounds/             # Audio assets
│
├── src/
│   ├── assets/             # Application assets
│   │   ├── branding/      # Brand assets (logos, images)
│   │   └── personal/      # Developer/personal assets
│   │
│   ├── components/         # Reusable React components
│   │   ├── ui/            # UI component library
│   │   │   ├── PrimaryButton.jsx
│   │   │   └── SecondaryButton.jsx
│   │   ├── Footer.jsx     # Application footer
│   │   ├── GlassCard.jsx  # Glassmorphism card component
│   │   ├── GradientBackground.jsx  # Gradient background component
│   │   ├── Hero.jsx       # Hero section component
│   │   └── Navbar.jsx     # Navigation bar component
│   │
│   ├── context/           # React Context providers
│   │   └── UserContext.jsx  # Authentication & user state management
│   │
│   ├── pages/             # Page components (routes)
│   │   ├── UserPages/  # User-related pages
│   │   │   ├── UserLogin.jsx
│   │   │   ├── UserRegister.jsx
│   │   │   ├── UserVerifyOtp.jsx
│   │   │   ├── UserHome.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── UserForgotPassword.jsx
│   │   │   └── UserResetPassword.jsx
│   │   ├── errorPages/    # Error pages
│   │   │   └── NotFound.jsx
│   │   ├── legalPages/    # Legal/compliance pages
│   │   │   ├── TermsPage.jsx
│   │   │   ├── PrivacyPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── FAQPage.jsx
│   │   ├── AboutPage.jsx  # About page
│   │   ├── Home.jsx       # Landing page
│   │   ├── Onboarding.jsx # Onboarding page
│   │   └── App.jsx        # Main app router component
│   │
│   ├── styles/            # CSS stylesheets
│   │   ├── ThemeTokens.css    # Design system tokens
│   │   ├── ResponsiveUtils.css # Responsive utilities
│   │   └── ZIndexLayers.css    # Z-index management
│   │
│   ├── App.css           # Global application styles
│   ├── App.jsx           # Main application component
│   ├── index.css         # Entry point CSS
│   └── main.jsx          # Application entry point
│
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── README.md            # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** version 18.x or higher
- **npm** version 9.x or higher (or **yarn**)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or with yarn:
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```
   
   **Note:** Replace `http://localhost:3000` with your backend API URL in production.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173` (default Vite port).

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

---

## 🛣️ Core Components and Routes

### Authentication Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/user/login` | `UserLogin` | User login page with email/password authentication |
| `/user/register` | `UserRegister` | User registration page |
| `/user/verify-otp` | `UserVerifyOtp` | OTP verification page for account activation |
| `/user/forgot-password` | `UserForgotPassword` | Password recovery initiation |
| `/user/reset-password` | `UserResetPassword` | Password reset with OTP verification |

### User Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/user/home` | `UserHome` | User dashboard with subscription management |
| `/user/profile` | `UserProfile` | User profile management page |

### Core Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Landing page with features and CTAs |
| `/onboarding` | `Onboarding` | Welcome/onboarding page |
| `/about` | `AboutPage` | About page with company information |

### Legal Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/legal/terms` | `TermsPage` | Terms and conditions |
| `/legal/privacy` | `PrivacyPage` | Privacy policy |
| `/legal/contact` | `ContactPage` | Contact information |
| `/legal/faq` | `FAQPage` | Frequently asked questions |

### Error Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `*` | `NotFound` | 404 error page for non-existent routes |

---

## 🔌 API Call Structure

### API Base URL Configuration

The API base URL is configured via environment variable `VITE_API_BASE_URL` and defaults to `http://localhost:3000` if not set.

**Location:** `src/context/UserContext.jsx`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Include cookies for session management
})
```

### Authentication API Calls

All authentication flows use the `UserContext` which provides centralized API communication:

#### User Login
- **Endpoint:** `POST /api/users/login`
- **Request Body:** `{ email, password }`
- **Response:** `{ success: boolean, user: object, token: string }`
- **Usage:** `loginUser(email, password, remember)`

#### User Registration
- **Endpoint:** `POST /api/users/register`
- **Request Body:** `{ firstname, lastname?, email, password }`
- **Response:** `{ success: boolean, message: string }`
- **Usage:** Direct axios call in `UserRegister.jsx`

#### OTP Verification
- **Endpoint:** `POST /api/users/verify-otp`
- **Request Body:** `{ otp: string }`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ success: boolean, message: string }`

#### Password Reset
- **Request OTP:** `POST /api/users/send-reset-password-otp`
- **Reset Password:** `POST /api/users/reset-password`
- **Request Body:** `{ email, otp, newPassword }`

### Profile API Calls

#### Fetch Profile
- **Endpoint:** `GET /api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ success: boolean, user: object }`

#### Upload Profile Picture
- **Endpoint:** `POST /api/users/upload-profile-pic`
- **Method:** `multipart/form-data`
- **Body:** `FormData` with `profilePic` field
- **Headers:** `Authorization: Bearer <token>`

### API Error Handling

All API calls include error handling:
- Network errors are caught and displayed via toast notifications
- Authentication errors (401) redirect to login page
- Validation errors are shown inline in forms
- Error messages come from backend `response.data.message`

---

## 🎨 Styling Frameworks/Libraries

### Tailwind CSS

The application uses **Tailwind CSS 4.x** for utility-first styling with custom configuration:

- **Configuration File:** `tailwind.config.js`
- **Custom Colors:** Brand colors (Primary: `#E43636`, Secondary: `#F6EFD2`, Accent: `#E2DDB4`, Neutral: `#000000`)
- **Theme System:** CSS variables for theme-aware colors
- **Dark Mode:** Class-based dark mode support
- **Glassmorphism:** Custom glass effect utilities

### Design System

**Theme Tokens:** `src/styles/ThemeTokens.css`

The design system includes:
- Brand color palette
- Theme-aware colors (light/dark)
- Glassmorphism effects
- Gradient utilities
- Shadow system
- Status colors (success, warning, error, info)

### CSS Architecture

- **Global Styles:** `src/index.css` and `src/App.css`
- **Theme Tokens:** `src/styles/ThemeTokens.css`
- **Utilities:** `src/styles/ResponsiveUtils.css`, `src/styles/ZIndexLayers.css`
- **Component Styles:** Tailwind utility classes + inline styles where needed

---

## 🔐 Authentication Flow

### Login Flow

1. User enters email and password on `/user/login`
2. Client-side validation (email format, password length)
3. `loginUser()` from `UserContext` is called
4. API request to `POST /api/users/login`
5. On success:
   - User data stored in context state
   - Session stored in `localStorage` (if remember=true) or `sessionStorage`
   - User redirected to home or dashboard
6. On error: Error message displayed via toast

### Registration Flow

1. User fills registration form on `/user/register`
2. Client-side validation (name length, email format, password match)
3. API request to `POST /api/users/register`
4. On success: Success message and redirect to login
5. User receives OTP via email
6. User verifies OTP on `/user/verify-otp`

### Session Management

- **Storage:** `localStorage` (persistent) or `sessionStorage` (temporary)
- **Storage Key:** `nextsubscription_auth`
- **Format:** `{ type: 'user', user: {...}, token: '...' }`
- **Restoration:** Automatic on app load via `UserContext` useEffect

### Protected Routes

Routes are protected by checking:
- `isAuthenticated` from `UserContext`
- User type matches expected type (`user`)
- Redirects to `/user/login` if not authenticated

---

## 🔄 State Management

### UserContext (`src/context/UserContext.jsx`)

Centralized authentication and user state management:

**State:**
- `user` - Current user object
- `isAuthenticated` - Authentication status
- `loading` - Loading state for auth operations
- `isInitialized` - Whether auth state has been restored

**Methods:**
- `loginUser(email, password, remember)` - User login
- `logout()` - Logout and cleanup
- `updateUserProfile(updatedData)` - Update user profile data

**Usage:**
```javascript
import { useUser } from '../context/UserContext'

const MyComponent = () => {
  const { user, isAuthenticated, loginCustomer, logout } = useUser()
  // ...
}
```

### Local Component State

Each component manages its own local state for:
- Form inputs
- UI toggles (modals, dropdowns)
- Loading states
- Error messages

---

## 📦 Key Dependencies

### Core
- **react** (^19.2.0) - React library
- **react-dom** (^19.2.0) - React DOM renderer
- **react-router-dom** (^7.9.5) - Client-side routing

### UI/Animation
- **framer-motion** (^12.23.24) - Animation library
- **react-toastify** (^11.0.5) - Toast notifications
- **@heroicons/react** (^2.2.0) - Icon library

### Styling
- **tailwindcss** (^4.1.16) - Utility-first CSS framework
- **@tailwindcss/vite** (^4.1.16) - Tailwind CSS Vite plugin

### HTTP/API
- **axios** (^1.13.2) - HTTP client for API calls

### Maps (if needed)
- **leaflet** (^1.9.4) - Map library
- **react-leaflet** (^5.0.0) - React bindings for Leaflet

### Development
- **vite** (^7.2.0) - Build tool and dev server
- **@vitejs/plugin-react** (^5.1.0) - React plugin for Vite
- **eslint** (^9.39.1) - Code linting

---

## 🌐 Backend Integration

### API Base URL Configuration

Configure the backend API URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production, update this to your production backend URL:
```env
VITE_API_BASE_URL=https://api.nextsubscription.com
```

### CORS Configuration

The backend must be configured to accept requests from the frontend domain:

**Development:**
- Frontend: `http://localhost:5173`
- Backend CORS origin: `http://localhost:5173`

**Production:**
- Frontend: `https://nextsubscription.com`
- Backend CORS origin: `https://nextsubscription.com`

### Authentication Headers

Authenticated requests include:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Session Cookies

The application uses `withCredentials: true` in axios config to include cookies for session management.

---

## 🎯 Component Architecture

### Page Components

Page components are located in `src/pages/` and represent individual routes:
- Handle route-specific logic
- Integrate multiple reusable components
- Manage page-level state
- Handle API calls for page data

### Reusable Components

Components in `src/components/` are reusable across the application:
- **Navbar** - Navigation bar with authentication state
- **Footer** - Application footer
- **GlassCard** - Glassmorphism card component
- **GradientBackground** - Gradient background component
- **Hero** - Hero section component

### UI Components

UI components in `src/components/ui/` provide consistent styling:
- **PrimaryButton** - Primary action button with gradients
- **SecondaryButton** - Secondary button with glassmorphism

---

## 🔧 Development Guidelines

### Code Style

- Use functional components with hooks
- Prefer named exports for components
- Add JSDoc comments for complex functions
- Use descriptive variable and function names

### File Naming

- Components: PascalCase (e.g., `CustomerLogin.jsx`)
- Utilities: camelCase (e.g., `formatDate.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Component Structure

```javascript
/**
 * Component Name and Description
 * 
 * Detailed component documentation
 * 
 * @component
 */

import React, { useState } from 'react'
// ... other imports

/**
 * Component Definition
 * 
 * @returns {JSX.Element} Component JSX
 */
const ComponentName = () => {
  // State declarations
  // Effects
  // Handlers
  // Render
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **API calls failing:**
   - Check `VITE_API_BASE_URL` in `.env`
   - Verify backend server is running
   - Check CORS configuration

2. **Authentication not persisting:**
   - Check browser storage (localStorage/sessionStorage)
   - Verify token is being stored correctly
   - Check UserContext initialization

3. **Styles not applying:**
   - Run `npm run build` to regenerate Tailwind classes
   - Check Tailwind config content paths
   - Verify CSS imports in `index.css`

4. **Routes not working:**
   - Ensure React Router is properly configured
   - Check route paths match backend expectations
   - Verify BrowserRouter is wrapping App

---

## ✅ Integration Note

**Status:** ✅ **FULLY INTEGRATED**

The frontend is now successfully connected to the backend API. All API routes are tested and fully functional.

### Integration Summary

- ✅ **API Base URL:** Configured via `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:3000`)
- ✅ **All Endpoints Connected:** Login, Register, Profile, OTP Verification, Password Reset
- ✅ **Authentication Flow:** JWT tokens stored in localStorage/sessionStorage, sent via Authorization header
- ✅ **CORS Configuration:** Backend configured to accept requests from `http://localhost:5173`
- ✅ **Session Management:** HTTP-only cookies supported for secure token storage
- ✅ **Redirect Flow:** Login/Signup → `/customer/home` (Customer Dashboard)
- ✅ **Error Handling:** Comprehensive error handling with toast notifications

### Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** For production, update this to your production backend URL.

### Verified Endpoints

All the following endpoints are tested and working:

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/users/register` | POST | ✅ | User registration |
| `/api/users/login` | POST | ✅ | User authentication |
| `/api/users/logout` | POST | ✅ | User logout |
| `/api/users/profile` | GET | ✅ | Get user profile |
| `/api/users/send-verification-otp` | POST | ✅ | Send verification OTP |
| `/api/users/verify-otp` | POST | ✅ | Verify account with OTP |
| `/api/users/send-reset-password-otp` | POST | ✅ | Request password reset |
| `/api/users/reset-password` | POST | ✅ | Reset password with OTP |
| `/api/users/upload-profile-pic` | POST | ✅ | Upload profile picture |
| `/api/users/update-profile-pic` | PUT | ✅ | Update profile picture |
| `/api/users/delete-profile-pic` | DELETE | ✅ | Delete profile picture |

### User Flows Verified

1. ✅ **Registration Flow:** Register → Login → Verify OTP → Dashboard
2. ✅ **Login Flow:** Login → Dashboard (with proper authentication)
3. ✅ **Password Reset:** Forgot Password → Enter OTP → Reset Password → Login
4. ✅ **Profile Management:** View Profile → Upload/Update/Delete Profile Picture
5. ✅ **Session Persistence:** Login state persists across page refreshes
6. ✅ **Logout Flow:** Logout → Clear session → Redirect to login

### Integration Version

**Version:** 1.0  
**Made by:** Gaurav Khatri  
**Integration Date:** January 2025

---

## 📝 Version History

### Version 1.1
- Visual refresh with new color palette (#E43636, #F6EFD2, #E2DDB4, #000000)
- Updated all components to use new branding
- Maintained glass-effect design across all pages
- Updated text content to reflect subscription management platform

### Version 1.0
- Initial release
- User authentication flow
- Profile management
- OTP verification
- Password reset functionality
- Responsive design
- Dark theme support

---

## 👤 Author & Credits

**Made by:** Gaurav Khatri  
**Version:** 1.1  
**Date:** 2025

---

## 📄 License

This project is part of the Next Subscription platform. All rights reserved.

---

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vite.dev/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review component documentation in source files
- Refer to backend API documentation

---

**Last Updated:** January 2025  
**Next Subscription Frontend v1.1 — Visual Refresh**

