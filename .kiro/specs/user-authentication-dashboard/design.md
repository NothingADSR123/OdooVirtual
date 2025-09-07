# Design Document

## Overview

The user authentication and dashboard feature will provide a clean, modern interface for Google-based authentication and profile management. The design leverages the existing Firebase setup and introduces a component-based architecture with proper state management, routing, and styling using the specified color palette.

The system will consist of two main pages (Login.jsx and Profile.jsx) with supporting components, context providers for authentication state, and utility functions for Firestore operations. The design emphasizes user experience with smooth transitions, loading states, and error handling.

## Architecture

### Component Structure
```
src/
├── pages/
│   ├── Login.jsx          # Google Sign-In page
│   └── Profile.jsx        # User dashboard and profile editing
├── components/
│   ├── AuthGuard.jsx      # Route protection component
│   ├── LoadingSpinner.jsx # Reusable loading indicator
│   └── ErrorMessage.jsx   # Reusable error display
├── context/
│   └── AuthContext.jsx    # Authentication state management
├── services/
│   └── userService.js     # Firestore user operations
├── hooks/
│   └── useAuth.js         # Custom authentication hook
└── styles/
    └── colors.js          # Color palette constants
```

### State Management Architecture
- **AuthContext**: Centralized authentication state using React Context
- **Local Component State**: Form data, loading states, and UI interactions
- **Firebase State**: Real-time authentication state via onAuthStateChanged

### Data Flow
1. **Authentication Flow**: Login → Firebase Auth → Context Update → Route Protection
2. **Profile Flow**: Profile Load → Firestore Query → Display → Edit → Firestore Update
3. **Error Flow**: Error Occurrence → Error State → User Notification

## Components and Interfaces

### AuthContext Provider
```javascript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UserProfileData) => Promise<void>;
}
```

**Responsibilities:**
- Manage global authentication state
- Provide authentication methods
- Handle Firebase Auth state changes
- Manage loading and error states

### Login.jsx Component
```javascript
interface LoginProps {}

interface LoginState {
  isLoading: boolean;
  error: string | null;
}
```

**Features:**
- Google Sign-In button with Firebase Auth integration
- Loading state during authentication
- Error handling and display
- Automatic redirect after successful login
- Responsive design with color scheme integration

### Profile.jsx Component
```javascript
interface ProfileProps {}

interface ProfileState {
  isEditing: boolean;
  formData: UserProfileData;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface UserProfileData {
  displayName: string;
  email: string;
  photoURL: string;
  username?: string;
  bio?: string;
  phone?: string;
}
```

**Features:**
- Display user information (name, email, profile picture)
- Toggle between view and edit modes
- Form validation and submission
- Real-time Firestore updates
- Success and error feedback

### AuthGuard Component
```javascript
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}
```

**Responsibilities:**
- Protect routes requiring authentication
- Redirect unauthenticated users to login
- Show loading state during auth check

## Data Models

### User Document (Firestore)
```javascript
// Collection: users
// Document ID: user.uid
{
  uid: string;           // Firebase Auth UID
  email: string;         // From Firebase Auth
  displayName: string;   // From Firebase Auth or custom
  photoURL: string;      // From Firebase Auth or uploaded
  username?: string;     // Custom username
  bio?: string;          // User biography
  phone?: string;        // Phone number
  createdAt: Timestamp;  // Account creation
  updatedAt: Timestamp;  // Last profile update
}
```

### Authentication State
```javascript
interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null;
  loading: boolean;
  error: string | null;
}
```

## Error Handling

### Authentication Errors
- **Network Issues**: Display retry option with user-friendly message
- **Popup Blocked**: Provide instructions for enabling popups
- **Cancelled Sign-In**: Silent handling, no error display
- **Invalid Credentials**: Generic error message for security

### Firestore Errors
- **Permission Denied**: Redirect to login or show access error
- **Network Timeout**: Retry mechanism with exponential backoff
- **Document Not Found**: Create new user document automatically
- **Validation Errors**: Field-specific error messages

### Error Display Strategy
- Toast notifications for temporary errors
- Inline form errors for validation issues
- Full-page error states for critical failures
- Graceful degradation for non-critical features

## Testing Strategy

### Unit Tests
- **AuthContext**: State management and method functionality
- **userService**: Firestore operations and error handling
- **Components**: Rendering, user interactions, and prop handling
- **Hooks**: Custom hook behavior and edge cases

### Integration Tests
- **Authentication Flow**: Complete login/logout process
- **Profile Management**: View, edit, and save profile data
- **Route Protection**: AuthGuard behavior with different auth states
- **Error Scenarios**: Network failures and permission issues

### E2E Tests
- **User Journey**: Login → Profile View → Edit → Save → Logout
- **Cross-Browser**: Chrome, Firefox, Safari compatibility
- **Mobile Responsive**: Touch interactions and layout
- **Performance**: Loading times and smooth transitions

## UI/UX Design Specifications

### Color Palette Implementation
```javascript
// colors.js
export const colors = {
  primary: '#124170',      // Dark blue - primary actions, headers
  secondary: '#26667F',    // Medium blue - secondary elements
  accent: '#67C090',       // Green - success states, highlights  
  background: '#DDF4E7',   // Light green - page backgrounds
  white: '#FFFFFF',        // Pure white - cards, forms
  gray: {
    light: '#F8F9FA',
    medium: '#6C757D',
    dark: '#343A40'
  }
}
```

### Component Styling Guidelines

**Login Page:**
- Centered layout with card-style container
- Google button with brand colors and hover effects
- Background gradient using primary color palette
- Responsive design for mobile and desktop

**Profile Page:**
- Two-column layout: profile info and edit form
- Profile picture with circular crop and border
- Form inputs with consistent styling and focus states
- Action buttons with primary/secondary color distinction

**Interactive Elements:**
- Buttons: Rounded corners, shadow effects, hover animations
- Forms: Clean borders, focus indicators, validation styling
- Loading States: Spinner with accent color, skeleton screens
- Transitions: Smooth 300ms ease-in-out for all interactions

### Responsive Design
- **Mobile First**: Base styles for mobile, progressive enhancement
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px  
  - Desktop: > 1024px
- **Touch Targets**: Minimum 44px for mobile interactions
- **Typography**: Scalable font sizes with good contrast ratios