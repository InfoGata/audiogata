import { Capacitor } from "@capacitor/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

const useWebServiceWorker = () => {
  const { t } = useTranslation();

  // onNeedReload is registered once, so read t() through a ref to keep the toast
  // in the current language after a language switch.
  const tRef = React.useRef(t);
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Under registerType "autoUpdate" the new worker activates itself, which means
  // needRefresh never fires and updateServiceWorker() is a no-op. Supplying
  // onNeedReload replaces the plugin's default window.location.reload(), so an
  // update never interrupts the user mid-session — they choose when to reload.
  useRegisterSW({
    onNeedReload() {
      toast(tRef.current("newVersion"), {
        action: {
          label: tRef.current("reload"),
          onClick: () => window.location.reload(),
        },
      });
    },
  });
};

// The native app has no service worker: it would keep serving the old bundle
// after an over-the-air update (see lib/service-worker.ts, which removes one
// left by an older install). Chosen once, since the platform can't change
// while the app runs, so the hook calls stay the same on every render.
const useNoServiceWorker = () => {};

const useUpdateServiceWorker = Capacitor.isNativePlatform()
  ? useNoServiceWorker
  : useWebServiceWorker;

export default useUpdateServiceWorker;
