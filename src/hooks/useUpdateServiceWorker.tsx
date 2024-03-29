import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

const useUpdateServiceWorker = () => {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const onDismiss = React.useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  React.useEffect(() => {
    if (needRefresh) {
      toast(t("newVersion"), {
        action: { label: t("reload"), onClick: () => updateServiceWorker() },
        onDismiss: () => onDismiss(),
      });
    }
  }, [t, needRefresh, updateServiceWorker, onDismiss]);
};

export default useUpdateServiceWorker;
