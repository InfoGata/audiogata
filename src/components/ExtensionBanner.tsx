import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useExtension } from "@/hooks/useExtension";
import { Capacitor } from "@capacitor/core";
import isElectron from "is-electron";

export const ExtensionBanner: React.FC = () => {
  const { t } = useTranslation();
  const { extensionDetected } = useExtension();
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem("extensionBannerDismissed") === "true";
  });
  
  const handleDismiss = () => {
    setBannerDismissed(true);
    localStorage.setItem("extensionBannerDismissed", "true");
  };
  
  // The desktop and Android apps make requests natively, so the extension
  // would add nothing there.
  if (
    extensionDetected !== false ||
    bannerDismissed ||
    isElectron() ||
    Capacitor.isNativePlatform()
  ) {
    return null;
  }
  
  return (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start justify-between">
      <div>
        <p className="text-sm font-bold mb-2">
          {t("extensionMessage")}
        </p>
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <a
            href="https://github.com/InfoGata/infogata-extension"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("installExtension")}
          </a>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="ml-4"
      >
        <X className="size-4" />
        <span className="sr-only">{t("close")}</span>
      </Button>
    </div>
  );
};
