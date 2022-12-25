import { OptionsObject, SnackbarKey, SnackbarMessage } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
const useOffline = (
  enqueueSnackbar:
    | ((message: SnackbarMessage, options?: OptionsObject) => SnackbarKey)
    | undefined,
  onClickDismiss: (key: SnackbarKey) => void
) => {
  const [key, setKey] = React.useState<SnackbarKey>();
  const { t } = useTranslation();

  React.useEffect(() => {
    const onOnline = () => {
      if (key) {
        onClickDismiss(key);
      }
    };
    const onOffline = () => {
      if (enqueueSnackbar) {
        const newKey = enqueueSnackbar(t("offline"), {
          variant: "error",
          persist: true,
        });
        setKey(newKey);
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [enqueueSnackbar, key, onClickDismiss, t]);
};

export default useOffline;
