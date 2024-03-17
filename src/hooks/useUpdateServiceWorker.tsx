import { Button } from "@mui/material";
import { OptionsObject, SnackbarKey, SnackbarMessage } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

const useUpdateServiceWorker = (
  enqueueSnackbar:
    | ((message: SnackbarMessage, options?: OptionsObject) => SnackbarKey)
    | undefined,
  onClickDismiss: (key: SnackbarKey) => void
) => {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const onDismiss = React.useCallback(
    (key: SnackbarKey) => {
      setNeedRefresh(false);
      onClickDismiss(key);
    },
    [onClickDismiss, setNeedRefresh]
  );

  React.useEffect(() => {
    if (needRefresh && enqueueSnackbar) {
      enqueueSnackbar(t("newVersion"), {
        persist: true,
        action: (key) => (
          <>
            <Button color="primary" onClick={() => updateServiceWorker()}>
              {t("reload")}
            </Button>
            <Button color="error" onClick={() => onDismiss(key)}>
              {t("dismiss")}
            </Button>
          </>
        ),
      });
    }
  }, [t, enqueueSnackbar, needRefresh, updateServiceWorker, onDismiss]);
};

export default useUpdateServiceWorker;
