import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const useOffline = () => {
  const [key, setKey] = React.useState<string | number>();
  const { t } = useTranslation();

  React.useEffect(() => {
    const onOnline = () => {
      if (key) {
        toast.dismiss(key);
      }
    };
    const onOffline = () => {
      const newKey = toast.error(t("offline"), { duration: Infinity });
      setKey(newKey);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [key, t]);
};

export default useOffline;
