
# Joel Barrientos - Developer Portfolio

A dynamic, high-performance portfolio website built with modern web technologies. This project showcases my work, writing, and journey, featuring a full custom admin dashboard for content management.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend/Database**: Local SQLite (LibSQL), Drizzle ORM
- **State Management**: React Hooks (custom data hooks)

## Key Features

### Dynamic UI
- **Hero Section**: Features rotating quotes with dynamic backgrounds managed via the database.
- **Projects Grid**: Full-screen, responsive grid layout with hover effects, gradient overlays, and detailed modal views.
- **Bookmarks**: Nested categorization system (Parent/Child categories) to organize resources.
- **Dark Mode**: Fully supported system-wide dark/light theme toggle.

### Admin Dashboard
A protected backoffice to manage all portfolio content without touching code:
- **Authentication**: Simple PIN-based login system.
- **Quotes Manager**: Create, edit, and delete quotes and their background styles.
- **Projects Manager**: Manage portfolio items, images, descriptions, and external links.
- **Bookmarks Manager**: Organize links into hierarchical categories.
- **Profile & Journey**: Update personal info and career timeline.

## Project Structure

- `src/components`: Public UI components (Hero, Projects, etc.)
- `src/pages/admin`: Private Admin interface components.
- `src/db`: Database schema, configuration, and seeds.
- `src/hooks`: Custom hooks for database data access (`useQuotes`, `useProjects`, etc.).
