/**
 * Whether this build has analytics at all. A fork or self-hosted build that
 * never sets a key loads no analytics and shows no setting for it.
 */
export const analyticsConfigured = Boolean(
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY
);

/** Whether the browser is asking not to be tracked. */
export const doNotTrackEnabled = (): boolean => {
  const nav = navigator as Navigator & { msDoNotTrack?: string | null };
  const win = window as Window & { doNotTrack?: string | null };
  return [nav.doNotTrack, nav.msDoNotTrack, win.doNotTrack].some(
    (flag) => flag === "1" || flag === "yes"
  );
};

/**
 * The user's choice, with Do Not Track able to veto it but never to enable
 * it. `disableAnalytics` is optional because settings persisted before it
 * existed don't carry it, and those users never turned anything off.
 *
 * Deliberately says nothing about whether a key is configured: without one
 * PostHog is never initialised, so there is nothing to capture through, and
 * folding that in here would make this answer differently on a machine with a
 * .env than on one without.
 */
export const shouldCapture = (
  disableAnalytics: boolean | undefined,
  doNotTrack: boolean
): boolean => !disableAnalytics && !doNotTrack;
