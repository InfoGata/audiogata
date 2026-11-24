import React from "react";
import { startOtaUpdates } from "@/lib/ota-update";

/**
 * Tells the updater this bundle booted, then checks for a newer one. It runs
 * in an effect inside the app's error boundary, so it only fires once the app
 * has committed its first render. A bundle that fails before that point is
 * never confirmed, and Capgo rolls it back. Renders nothing, and does nothing
 * outside the native app.
 */
const OtaUpdates: React.FC = () => {
  React.useEffect(() => {
    void startOtaUpdates();
  }, []);
  return null;
};

export default OtaUpdates;
