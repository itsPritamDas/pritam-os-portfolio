# Pritam OS — Interactive Developer Portfolio

A Windows 11-inspired, interactive desktop portfolio built with React, TypeScript, Vite, Motion for React and Lucide icons. Version 1.1 focuses on a clean, readable desktop experience with solid app windows and restrained transitions.

## Visual refresh (v1.1)

The interface has been restyled to feel closer to a familiar Windows 11 desktop: a clean blue desktop background, shortcut icons, centered translucent taskbar, bright Start menu, solid app windows with title-bar controls, and larger high-contrast type. Portfolio applications use plain, readable surfaces rather than decorative animated cards. Motion is reduced, and the layout adapts to smaller screens.

## Included experience

- Power-on screen, skip intro and a 5-second boot sequence with a full-screen background video during “Preparing your workspace”
- Desktop with familiar shortcut icons, blue Windows-style wallpaper and a centered translucent taskbar
- Start menu with app search and pinned applications
- Taskbar with running-app indicators, clock and power control
- Window manager with open, close, minimize, maximize and drag interactions
- About, Projects, Skills, Experience, Education, Terminal, Resume, Contact and Certificates apps
- Project search and category filters
- Interactive terminal commands: `help`, `about`, `skills`, `projects`, `contact`, `clear`
- Resume PDF preview and download
- Shutdown, restart and light/dark theme controls
- Bright Start menu, clear title bars and readable app content for projects, skills, certificates and profile details
- Responsive mobile layout, keyboard focus states and reduced-motion support
- System-font typography (Segoe UI / system fallback); no external font download required

## Add your 5-second workspace video

Copy your video into this exact location and keep the filename unchanged:

```text
public/videos/workspace-intro.mp4
```

The video starts muted and automatically when the user clicks **Power on**. The progress indicator runs from 0% to 100% over the same 5-second boot sequence, then the desktop opens. The video is only shown during this startup sequence; it does not cover the desktop or its application windows. Use an MP4 encoded with H.264 for broad browser compatibility. If the video file is not present yet, the boot screen keeps its gradient background and the project still builds.

## Run locally

You need Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

Create a production build:

```bash
npm run build
npm run preview
```

The production site is generated in `dist/` and can be deployed to GitHub Pages, Netlify, Vercel or another static host.

## Personalize your details

Most profile information lives in one file:

```text
src/data/profile.ts
```

Edit your name, summary, contact information, education, experience, leadership, skills, project descriptions, statistics and certification list there.

Replace the supplied resume at:

```text
public/resume/Pritam_Das_Resume.pdf
```

Keep the filename the same unless you also update the resume iframe and download links in `src/App.tsx`.

## Important profile verification before publishing

Your latest chat message says **Jadavpur University**, so the editable website profile currently uses Jadavpur University. However, the latest resume PDF available in the shared Library (Pritam_Das_Resume_CentricaSoft.pdf, 21 Nov 2026) still lists **JIS University, Kolkata**. This creates a mismatch between the website profile and the included PDF. Verify the correct institution and replace the PDF at `public/resume/Pritam_Das_Resume.pdf` with a matching updated resume before deploying.

Other details such as CGPA, LeetCode total, LinkedIn followers, leadership tenure and certification names are editable in the same file. Review them for accuracy and currency before publishing.

## Project links

Project-specific repository and demo URLs were not present in the resume source available for this package. The project cards therefore link to your GitHub profile only where appropriate; add the exact repository/demo URLs once confirmed. No repository links have been guessed.

## Profile sources used

- Latest resume PDF available in the shared Library, copied to `public/resume/Pritam_Das_Resume.pdf`.
- Additional project, skill, leadership and learning details shared in previous conversations.

This is a starter implementation. It does not include private API keys, server-side authentication, visitor tracking or an actual operating system.
