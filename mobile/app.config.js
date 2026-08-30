/**
 * Extends app.json with the bits that only exist once the app is linked to an
 * Expo account.
 *
 * The project id is read from whichever source is present: `eas init` writes it
 * into app.json when you link from your own machine, and CI can pass it as an
 * environment variable instead. Either way the update URL and runtime version
 * are derived from it, so `eas update:configure` is never needed.
 *
 * A fresh clone with no Expo account still runs `expo start` normally.
 */
module.exports = ({ config }) => {
  const projectId = process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId
  const owner = process.env.EXPO_OWNER || config.owner

  return {
    ...config,
    ...(owner ? { owner } : {}),
    // Over-the-air updates only mean something once there is a project to publish to.
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
  }
}
