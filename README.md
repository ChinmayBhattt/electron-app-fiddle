# Personal Dashboard

A premium, modern desktop application built for personal productivity using Electron and Tailwind CSS. The app features a single-window interface with dark mode, smooth animations, and glassmorphic aesthetics.

## Features

- **Gorgeous UI:** Premium design resembling top-tier productivity tools (Notion/Linear).
- **Dark Mode by Default:** Seamless integration with OS preferences, or manual toggle via Settings and the Sidebar.
- **Notes App:** Add, edit, delete, and search personal notes effortlessly.
- **Tasks Manager:** Keep track of your to-dos, mark them complete, and assign priorities (High, Medium, Low).
- **Dashboard Overview:** Get a quick glance at your total notes, active tasks, and completed tasks.
- **Custom Titlebar:** Fully custom un-framed window for a modern look.
- **Keyboard Shortcuts:** 
  - `Ctrl + N` (or `Cmd + N` on Mac) for a New Note.
  - `Ctrl + T` (or `Cmd + T` on Mac) to Add a Task.
- **Local Storage:** 100% private. All data is securely stored on your local machine using localStorage. No backend required.

## Tech Stack

- **Framework:** [Electron](https://www.electronjs.org/) (Version 30+)
- **Styling:** [Tailwind CSS v3.4](https://tailwindcss.com/)
- **Icons:** [Phosphor Icons](https://phosphoricons.com/)
- **Build Tool:** Electron Forge

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChinmayBhattt/electron-app-fiddle.git
   cd electron-app-fiddle
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the app in development mode:
   ```bash
   npm start
   ```

## Building Distributables

To package the application into a standalone executable (`.exe`, `.dmg`, `.AppImage`):

```bash
npm run make
```

Depending on your host OS, this will generate the executables in the `out/` directory.

> **Note:** Building Windows installers (`.exe`) on a Mac usually requires additional tools like `mono` and `wine`, or is best done via CI/CD pipelines (e.g., GitHub Actions).

## Project Structure

- `package.json` - Scripts and dependencies.
- `main.js` - Electron main process and custom Window/IPC handling.
- `preload.js` - Context bridge securing the renderer process.
- `index.html` - Complete UI structure using Tailwind.
- `renderer.js` - Logic for components, sidebars, modals, notes, and tasks.

## License

MIT License.
