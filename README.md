<p align="center">
  <img src="https://img.shields.io/badge/Harvest-Community_Operations-7C3AED?style=for-the-badge&logo=react&logoColor=white" alt="Harvest badge" />
</p>

<h1 align="center">🌱 Harvest</h1>

<p align="center">
  <strong>Automated Member Engagement and Tracking Platform for PUP SONs</strong>
</p>

<p align="center">
  A React-based web application for <strong>PUP Seeds of the Nations</strong> that brings member management, weekly activity tracking, evangelism monitoring, fundraising oversight, content planning, and AI-assisted insights into one streamlined dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-ESNext-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Radix_UI-Accessible-111827?style=flat-square&logo=radixui&logoColor=white" alt="Radix UI" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-3178C6?style=flat-square&logo=recharts&logoColor=white" alt="Recharts" />
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-development-notes">Development Notes</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## 📖 Overview

This repository contains a code bundle for Harvest: Automated Member Engagement and Tracking Platform for PUP SONs. The original project was designed from a Figma prototype and is now delivered as a Vite-powered React application focused on managing cell-group operations for PUP Seeds of the Nations.

The platform combines a modular dashboard experience with analytics, content planning, fundraising oversight, and AI-assisted features, making it suitable for both day-to-day administration and reporting workflows.

---

## ✨ Features

| Feature                                  | Description                                                               |
| :--------------------------------------- | :------------------------------------------------------------------------ |
| 👥 **Member Management**                 | Organizes people and cell-group records in a centralized interface.       |
| 📅 **Weekly Activity Tracking**          | Supports regular activity and progress logging for group operations.      |
| 🧑‍🏫 **Training & Evangelism Modules**     | Helps track outreach, disciple-making, and learning programs.             |
| 💰 **Fundraising & Financial Reporting** | Provides a structured view for financial monitoring and reporting.        |
| 🗓️ **Content & Meeting Tools**           | Includes content calendar and meeting minutes support for administration. |
| 📊 **Analytics Dashboard**               | Presents key metrics through charts and summaries using Recharts.         |
| 🤖 **Gemini-Powered AI Module**          | Adds AI-assisted features to support operational workflows.               |

---

## 🛠 Tech Stack

| Layer           | Technologies                               |
| :-------------- | :----------------------------------------- |
| Frontend        | React 18, TypeScript, Vite 6, Tailwind CSS |
| UI Components   | Radix UI primitives, Lucide React, Sonner  |
| Data & Services | Supabase JS, Hono, Recharts                |
| Build & Tooling | npm, Vite, TypeScript, SWC plugin          |

---

## 📁 Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── MembersModule.tsx
│   │   ├── CellGroupsModule.tsx
│   │   ├── WeeklyTrackerModule.tsx
│   │   ├── EvangelismModule.tsx
│   │   ├── TrainingModule.tsx
│   │   ├── FundraisingModule.tsx
│   │   ├── ContentCalendarModule.tsx
│   │   ├── MeetingMinutesModule.tsx
│   │   └── GeminiModule.tsx
│   ├── components/ui/
│   ├── supabase/
│   ├── utils/
│   └── styles/
├── docs/
│   ├── README.md
│   ├── description.txt
│   ├── repo.md
│   └── WEB_CONTRIBUTING.md
├── screenshots/
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

The development server will start on the default Vite local port.

### Build for production

```bash
npm run build
```

---

## 📚 Docs and Screenshots

- `docs/` contains repository design references, contribution standards, and project documentation.
- `screenshots/` is reserved for UI mockups, app screenshots, and visual assets.

---

---

## 🧩 Development Notes

- The app is built with TypeScript and Vite 6.
- UI components are organized under the component layer and styled with Tailwind CSS.
- Supabase utilities and edge-function-related files are stored under the Supabase folder.
- No dedicated test framework is currently configured in the project scripts.

---

## 🤝 Contributing

Contributions are welcome. If you would like to improve the experience, extend the modules, or refine the dashboard workflow, feel free to open an issue or submit a pull request with a clear summary of the change.

---

## 📄 License

A dedicated license file is not included in the current workspace snapshot, so please review the repository contents and any upstream project terms before redistribution or commercial use.

---

## 🙏 Acknowledgements

- React
- Vite
- Tailwind CSS
- Supabase
- Radix UI
- Recharts
- Lucide React

<p align="center">
  <strong>Built with 💡 for community operations and digital stewardship</strong>
</p>
