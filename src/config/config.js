// Central application configuration.
//
// Values are injected at build time from environment variables (see .env.example).
// A single configuration module keeps environment-specific settings in one place
// and avoids scattering hard-coded values across the codebase, which simplifies
// configuration management across development, staging and production.

const config = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Warrigal Park FC',
  storageKey: import.meta.env.VITE_STORAGE_KEY || 'wpfc.club.v1',
  currentSeason: import.meta.env.VITE_CURRENT_SEASON || '2026',
  seasonStart: import.meta.env.VITE_SEASON_START || '2026-03-01',
  juniorAge: 18,
}

export default config
