---
description: Repository Information Overview
alwaysApply: true
---

# Harvest Information

## Summary
**Harvest: Automated Member Engagement and Tracking Platform for PUP SONs** is a React-based web application designed for tracking and managing cell group activities for **PUP Seeds of the Nations**. It provides a comprehensive suite of modules for member management, weekly activity tracking, evangelism monitoring, financial reporting, and content management, integrated with a dashboard for analytics and a Gemini-powered AI module.

## Structure
- **src/components/**: Contains the core feature modules:
  - `AnalyticsDashboard.tsx`: Data visualization and summary statistics.
  - `MembersModule.tsx`, `CellGroupsModule.tsx`: Management of people and groups.
  - `WeeklyTrackerModule.tsx`, `EvangelismModule.tsx`, `TrainingModule.tsx`: Activity logging.
  - `FundraisingModule.tsx`: Financial tracking.
  - `ContentCalendarModule.tsx`, `MeetingMinutesModule.tsx`: Administrative tools.
  - `GeminiModule.tsx`: AI-assisted features.
- **src/components/ui/**: Reusable UI components built on **Radix UI** primitives and styled with **Tailwind CSS**.
- **src/supabase/**: Contains Supabase Edge Functions and related configurations.
- **src/utils/**: Utility functions and Supabase client initialization.
- **src/styles/**: Global CSS and Tailwind configurations.
- **SONS/**: Directory containing project screenshots and design references.

## Language & Runtime
**Language**: TypeScript  
**Version**: ESNext (target)  
**Build System**: Vite 6  
**Package Manager**: npm  

## Dependencies
**Main Dependencies**:
- **React 18**: Frontend framework.
- **Supabase JS**: Backend-as-a-Service integration.
- **Radix UI**: Comprehensive set of accessible UI primitives (Accordion, Dialog, Tabs, etc.).
- **Lucide React**: Icon library.
- **Recharts**: Data visualization library.
- **Sonner**: Toast notifications.
- **Hono**: Small web framework (used in dependencies).
- **Tailwind CSS**: Utility-first CSS framework (via `tailwind-merge` and `clsx`).

**Development Dependencies**:
- **Vite**: Frontend build tool.
- **@vitejs/plugin-react-swc**: Fast React plugin for Vite using SWC.
- **TypeScript**: Static typing.

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Build for production
npm run build
```

## Main Files & Resources
- **Entry Point**: `src/main.tsx`
- **Main App Component**: `src/App.tsx`
- **Configuration**: `vite.config.ts`, `package.json`
- **Database Utilities**: `src/utils/supabase/`
- **Styles**: `src/index.css`, `src/styles/globals.css`

## Testing
No testing framework (Jest, Vitest, etc.) is currently configured in the project's scripts or root directory.
