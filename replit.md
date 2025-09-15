# Overview

AdminIA is a multi-platform document management system that leverages AI for intelligent document processing and analysis. The application consists of a React web client, React Native mobile app, and Node.js/Express backend server, all sharing TypeScript type definitions. The system enables users to scan, upload, categorize, and analyze documents using OpenAI's GPT models, with secure cloud storage via Google Cloud Storage and subscription management through Stripe.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Full-Stack TypeScript Architecture
The project uses a monorepo structure with shared TypeScript schemas and types across web, mobile, and server platforms. All code is written in TypeScript with ES modules, enabling type safety and code reuse between frontend and backend.

## Frontend Architecture

### Web Client (React + Vite)
- **Framework**: React 18 with TypeScript, bundled using Vite
- **UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with custom design system variables and responsive design
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: React-i18next with support for French, English, Spanish, German, Italian, Chinese, Korean, and Arabic
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: Uppy.js with AWS S3 integration for direct-to-cloud uploads

### Mobile App (React Native + Expo)
- **Framework**: React Native with Expo SDK 54
- **UI Components**: React Native Paper with custom theming
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **Camera Integration**: Expo Camera for document scanning
- **File System**: Expo FileSystem for local document storage and management
- **Offline Support**: Custom offline storage service with sync capabilities
- **Cross-Platform**: Supports iOS and Android with platform-specific optimizations

## Backend Architecture

### Express.js Server
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon Database)
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **File Storage**: Google Cloud Storage with custom ACL policies
- **AI Integration**: OpenAI GPT models for document analysis and text extraction
- **Payment Processing**: Stripe for subscription management

### Database Schema
- **Users**: Profile data, subscription status, and Stripe integration
- **Documents**: Metadata, processing status, and object storage references
- **Categories**: Document classification system
- **Subscriptions**: Billing history and subscription management
- **Sessions**: Authentication session storage
- **AI Processing Queue**: Asynchronous document analysis tracking

### Security and Authentication
- **Authentication Method**: Replit Auth with OIDC integration
- **Session Security**: HTTP-only cookies with CSRF protection
- **Object Access Control**: Custom ACL system for document permissions
- **API Security**: Express middleware for authentication and authorization
- **CORS Configuration**: Configured for multi-origin support

## Data Flow Architecture

### Document Processing Pipeline
1. **Upload**: Direct-to-S3 uploads with presigned URLs
2. **Metadata Storage**: Document metadata saved to PostgreSQL
3. **AI Analysis**: Asynchronous processing queue for OpenAI analysis
4. **Categorization**: Automatic document classification
5. **Storage**: Processed documents stored with appropriate ACL policies

### Real-time Features
- **Upload Progress**: Real-time upload status via Uppy.js
- **Processing Status**: Live updates on document analysis progress
- **Notifications**: Toast notifications for user feedback

## External Dependencies

### Cloud Services
- **Google Cloud Storage**: Primary object storage with custom authentication via Replit sidecar
- **Neon Database**: PostgreSQL hosting with connection pooling
- **OpenAI API**: GPT models for document analysis and text extraction
- **Stripe**: Payment processing and subscription management
- **Replit Auth**: OAuth provider for user authentication

### Development Tools
- **Vite**: Frontend build tool with hot reloading and optimized production builds
- **Expo**: React Native development platform with managed workflow
- **Drizzle Kit**: Database migration and schema management
- **TanStack Query**: Server state management and caching
- **ESBuild**: Server-side bundling for production deployment

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Unstyled, accessible UI primitives
- **React Native Paper**: Material Design components for mobile
- **FontAwesome**: Icon library for web interface
- **Material Icons**: Icon set for mobile interface

### Internationalization and Localization
- **i18next**: Internationalization framework with React and React Native bindings
- **Multi-language Support**: Comprehensive localization for 8+ languages
- **Dynamic Language Switching**: Runtime language changes with persistent preferences