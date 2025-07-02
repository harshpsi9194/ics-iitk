# Institute Counselling Service Portal - Developer Guide

## Overview
This is a modern web application for the Institute Counselling Service at IIT Kanpur, built with React, TypeScript, and Tailwind CSS. The application features a login system and dashboard with a beautiful purple theme matching the institutional branding.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd ics-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Local storage for user session

### Project Structure
```
src/
├── components/
│   ├── ui/           # Shadcn UI components
│   ├── LoginForm.tsx # Login page component
│   └── Dashboard.tsx # Dashboard page component
├── assets/
│   └── hello-iitk-logo.png
├── pages/
│   └── NotFound.tsx
├── lib/
│   └── utils.ts
├── hooks/
├── App.tsx
├── main.tsx
└── index.css      # Design system & Tailwind configuration
```

## 🎨 Design System

### Color Palette
The application uses a purple-based color scheme inspired by IIT Kanpur branding:

```css
/* Primary Colors */
--primary: 258 85% 35%;           /* Deep purple */
--primary-light: 258 85% 45%;     /* Lighter purple */
--primary-glow: 258 85% 55%;      /* Glowing purple */

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-light)));
--gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%);
```

### Component Variants
Custom button variants have been created for different use cases:

- `hero`: Gradient background with glow effects
- `ics`: Institute-specific styling with enhanced interactions
- `resource`: Resource card buttons with purple theming

### Animations
- `fade-in`: Smooth fade-in animation for page elements
- `slide-up`: Upward slide animation for content
- Hover effects with scale transforms and shadow changes

## 📱 Features

### Authentication Flow
1. **Login Page** (`/`)
   - Username input (IITK username without domain)
   - Password input with visibility toggle
   - Form validation
   - Stores username in localStorage on successful login

2. **Dashboard** (`/dashboard`)
   - Protected route (redirects to login if not authenticated)
   - Welcome message with user's name
   - Sidebar navigation
   - Resource cards with lock icons
   - Logout functionality

### Key Components

#### LoginForm Component
- Responsive design with grid layout
- Logo display section
- Form with validation
- Password visibility toggle
- Smooth animations

#### Dashboard Component
- Sidebar navigation using Shadcn sidebar components
- Header with logo and user info
- Welcome card with gradient background
- Resource cards grid
- Logout functionality

## 🔧 Development

### Adding New Features

#### Creating New Pages
1. Create component in `src/components/` or `src/pages/`
2. Add route to `App.tsx`
3. Update navigation if needed

#### Styling Guidelines
- Use semantic color tokens from the design system
- Leverage existing component variants
- Follow the established animation patterns
- Maintain responsive design principles

#### Example: Adding a New Button Variant
```tsx
// In src/components/ui/button.tsx
export const buttonVariants = cva(
  // ... existing code
  {
    variants: {
      variant: {
        // ... existing variants
        newVariant: "bg-custom text-custom-foreground hover:bg-custom/90",
      }
    }
  }
)
```

### State Management
Currently uses localStorage for user session:
- `iitk_username`: Stores the logged-in user's username

For more complex state, consider adding:
- React Context for global state
- TanStack Query for server state (already configured)

### Environment Configuration
The application is configured for:
- Development server on port 8080
- Hot module replacement
- TypeScript strict mode
- ESLint configuration

## 🎯 Customization

### Branding
- Logo: Replace `src/assets/hello-iitk-logo.png`
- Colors: Update CSS variables in `src/index.css`
- Typography: Configure in `tailwind.config.ts`

### Resource Cards
Add new resources by modifying the `resourceItems` array in `Dashboard.tsx`:

```tsx
const resourceItems = [
  {
    title: "New Resource Title",
    description: "Resource description",
    locked: false // Set to false to enable access
  }
  // ... existing items
];
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built application will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🔍 Troubleshooting

### Common Issues

1. **Images not loading**: Ensure images are imported as ES6 modules
2. **Routing issues**: Check that all routes are properly defined in App.tsx
3. **Style conflicts**: Use semantic tokens instead of direct Tailwind classes
4. **Build errors**: Check TypeScript errors and fix imports

### Debug Mode
- Open browser dev tools
- Check console for errors
- Use React Developer Tools extension

## 📝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow existing component patterns
- Use semantic commit messages
- Add proper JSDoc comments for complex functions

### Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

## 🤝 Support

For technical issues or questions:
1. Check the troubleshooting section
2. Review component documentation
3. Check existing issues in the repository
4. Contact the development team

---

Built with ❤️ for IIT Kanpur Institute Counselling Service
