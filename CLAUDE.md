# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AudioGata is a plugin-based web music player application that allows users to play audio from various sources through a unified interface. It's designed as a cross-platform application that works on web, Android (via Capacitor), and desktop (via Electron).

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Ports are unique per app in `~/projects/webapps` and `strictPort` is on, so a
collision fails instead of drifting: dev 3001, preview 4001, electron renderer 5001.

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

Plugins take a different path depending on whether the InfoGata extension is
present: with it they fetch directly, without it they go through whatever proxy
the plugin falls back to. Load any page with `?noextension` to take the second
path in a browser that has the extension installed -- `hasExtension` comes from
`@infogata/extension-components` and reports the extension as absent for that
tab until `?noextension=0`. Removing the origin from the extension's own list is
the only other way, and it affects every app.

## Architecture

### Plugin System

The core of AudioGata is its plugin architecture:

- Plugins run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame)
- Each plugin runs on its own subdomain (`[pluginId].audiogata.com`)
- Plugins provide consistent interfaces for different audio sources (YouTube, SoundCloud, Spotify, etc.)
- Communication between app and plugins uses a message-based API

**Dev Plugin Auto-Reload**:
- Plugins installed from `localhost` URLs are auto-polled every 3 seconds for changes
- To develop a plugin locally: serve its folder (`npx serve . -p 8080 --cors`), install via URL (`http://localhost:8080/manifest.json`), then run the plugin build in watch mode
- Changes are detected by comparing script content and auto-applied (logged to console as `[dev] Auto-updating plugin: ...`)

### Versioning

`package.json` is the single source of truth, changed only by `npm version
<major|minor|patch>`. `build-info.ts` injects `__APP_VERSION__` and
`__APP_COMMIT__` (from `git describe --always --dirty`) into both vite configs,
`src/lib/app-version.ts` is what the app reads, and `android/app/build.gradle`
derives `versionName` and `versionCode` from the same file (`0.1.0` -> `100`,
`1.2.3` -> `10203`). Never hardcode a version anywhere else. The About page
shows the build, and tapping it copies the build, platform and user agent.

### State Management

- Redux with Redux Toolkit for global state
- Main state slices:
  - `track`: Current playback, queue, history
  - `playlist`: User playlists and collections
  - `settings`: Application configuration
  - `ui`: Interface state
  - `download`: Download management

### Bundle

`autoCodeSplitting` on the tanstackRouter plugin gives each route its own chunk.
The plugin must be listed **before** `react()` in `vite.config.ts`: it rewrites
route files and has to see them before JSX is transformed, and the build fails
with a plugin-order error if swapped. The service worker precaches every chunk,
so this moves code off the first-load path without changing what is eventually
downloaded. The electron renderer config doesn't use the router plugin and
still bundles routes statically.

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
- Plugin documentation: [https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest](https://infogata.github.io/audiogata-plugin-typings/plugins/plugin-manifest)
- Several reference implementations available:
  - [youtube-audiogata](https://github.com/InfoGata/youtube-audiogata)
  - [soundcloud-audiogata](https://github.com/InfoGata/soundcloud-audiogata)
  - [spotify-audiogata](https://github.com/InfoGata/spotify-audiogata)