import { Button } from "@mui/material";
import { OptionsObject, SnackbarKey, SnackbarMessage } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../store/hooks";

const useUpdateServiceWorker = (
  enqueueSnackbar:
    | ((message: SnackbarMessage, options?: OptionsObject) => SnackbarKey)
    | undefined,
  onClickDismiss: (key: SnackbarKey) => void
) => {
  const waitingServiceWorker = useAppSelector(
    (state) => state.ui.waitingServiceWorker
  );
  const { t } = useTranslation();

  React.useEffect(() => {
    const updateServiceWorker = () => {
      if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });

        waitingServiceWorker.addEventListener("statechange", (e) => {
          const sw = e?.target as ServiceWorker;
          if (sw.state === "activated") {
            window.location.reload();
          }
        });
      }
    };

    if (waitingServiceWorker && enqueueSnackbar) {
      enqueueSnackbar(t("newVersion"), {
        persist: true,
        action: (key) => (
          <>
            <Button color="primary" onClick={updateServiceWorker}>
              {t("reload")}
            </Button>
            <Button color="error" onClick={() => onClickDismiss(key)}>
              {t("dismiss")}
            </Button>
          </>
        ),
      });
    }
  }, [waitingServiceWorker, t, enqueueSnackbar, onClickDismiss]);
};

export default useUpdateServiceWorker;
