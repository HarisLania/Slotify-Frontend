// Production environment. Only build-time flags live here — the actual backend
// URL is resolved at runtime from `configUrl` by ConfigService, so it can change
// without a rebuild (see public/config.json).
export const environment = {
  production: true,
  configUrl: '/config.json',
};
