/**
 * Extends app.json with the bits that only exist once the app is linked to an
 * Expo account. Kept in env vars so a fresh clone still runs `expo start`
 * without any account, and CI can publish without committing account IDs.
 */
const projectId = process.env.EAS_PROJECT_ID || undefined
const owner = process.env.EXPO_OWNER || undefined

module.exports = ({ config }) => ({
  ...config,
  ...(owner ? { owner } : {}),
  // Over-the-air updates only make sense once there is a project to publish to.
  ...(projectId
    ? {
        updates: { url: `https://u.expo.dev/${projectId}`, fallbackToCacheTimeout: 0 },
        runtimeVersion: { policy: 'appVersion' },
      }
    : {}),
  extra: {
    ...(config.extra ?? {}),
    ...(projectId ? { eas: { projectId } } : {}),
  },
})
