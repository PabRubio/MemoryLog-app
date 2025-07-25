## Architecture Overview

This is a React Native mobile app built with Expo Router for navigation and NativeWind for styling. The app is called "MemoryLog" - a photo journaling application where users can create memory snippets with images, captions, and emojis.

### Key Technologies
- **Expo Router 5.0** - File-based routing system
- **NativeWind** - Tailwind CSS for React Native styling
- **Firebase** - Authentication and backend services
- **React Native Modalize** - Modal components for creating new snippets
- **Expo Image Picker** - For selecting photos from device

### Project Structure
- `app/` - Contains all routes and screens using Expo Router file-based routing
  - `_layout.js` - Root layout with gesture handler setup
  - `index.js` - Main screen with MemoryLog component
  - `firebase.js` - Firebase configuration and initialization
- `assets/` - Static assets (images, icons)
- `tailwind.config.js` - Tailwind configuration for NativeWind

### App Features
- Photo journaling with image upload capability
- Caption text input (limited to 50 characters)
- Emoji selection for memory categorization
- Modal-based snippet creation interface
- Gradient text branding using MaskedView and LinearGradient

### Styling System
The app uses NativeWind (Tailwind CSS for React Native) with a dark theme:
- Primary colors: Blue (#3b82f6) and Purple (#8b5cf6) gradients
- Dark background: Gray-900 (#1f2937)
- Text colors: Gray-100 for primary text, Gray-400 for secondary

### Development Notes
- Uses Expo SDK 53 with new architecture enabled
- TypeScript support configured but files are currently in JavaScript
- Gesture handling setup in root layout for modal interactions
- Responsive design with conditional rendering based on screen width
