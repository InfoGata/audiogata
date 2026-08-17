import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";
import { useExtension } from "./useExtension";

/**
 * Reactive version of `isCorsDisabled` from utils. The extension injects
 * `window.InfoGata` after the app has already rendered, so a plain call during
 * render can miss it on first load. This re-renders once the extension is
 * detected.
 */
export const useCorsDisabled = () => {
  const { extensionDetected } = useExtension();
  return (
    extensionDetected === true || isElectron() || Capacitor.isNativePlatform()
  );
};

export default useCorsDisabled;
