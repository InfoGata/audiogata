# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AudioGata is a plugin-based web music player application that allows users to play audio from various sources through a unified interface. It's designed as a cross-platform application that works on web, Android (via Capacitor), and desktop (via Electron).

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Start development server with CORS server (recommended)
npm run dev

# Start just the development server
npm start

# Run CORS server separately (needed for cross-origin requests)
npm run cors-server
```

### Building

```bash
# Build web application
npm run build

# Preview built application
npm run preview

# Android - Build and sync with Capacitor
npm run cap:build

# Android - Build and run on Android device/emulator
npm run android

# Electron - Run in development mode
npm run electron:dev

# Electron - Preview electron build
npm run electron:start

# Electron - Build electron application
npm run electron:build
```

### Testing and Linting

```bash
# Run tests with Vitest
npm test

# Run ESLint
npm run lint
```

## Architecture

### Plugin System

The core of AudioGata is its plugin architecture:

- Plugins run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame)
- Each plugin runs on its own subdomain (`[pluginId].audiogata.com`)
- Plugins provide consistent interfaces for different audio sources (YouTube, SoundCloud, Spotify, etc.)
- Communication between app and plugins uses a message-based API

### State Management

- Redux with Redux Toolkit for global state
- Main state slices:
  - `track`: Current playback, queue, history
  - `playlist`: User playlists and collections
  - `settings`: Application configuration
  - `ui`: Interface state
  - `download`: Download management

### Data Persistence

- Dexie.js (IndexedDB wrapper) for local data storage
- Redux Persist for maintaining state between sessions
- Cached audio content for offline playback

### UI Framework

- React with TypeScript
- TanStack Router for routing
- Tailwind CSS with shadcn/ui components
- Responsive design with mobile and desktop layouts

## Plugin Development

- Plugins must implement specific interfaces defined in [audiogata-plugin-typings](https://github.com/InfoGata/audiogata-plugin-typings)
- Plugin documentation: [https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest/](https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest/)
- Several reference implementations available:
  - [youtube-audiogata](https://github.com/InfoGata/youtube-audiogata)
  - [soundcloud-audiogata](https://github.com/InfoGata/soundcloud-audiogata)
  - [spotify-audiogata](https://github.com/InfoGata/spotify-audiogata)