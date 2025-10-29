import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { hasExtension } from "@/utils";

export const ExtensionBanner: React.FC = () => {
  const { t } = useTranslation();
  const [extensionDetected, setExtensionDetected] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem("extensionBannerDismissed") === "true";
  });
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let detected = false;
    
    const checkExtension = () => {
      if (hasExtension()) {
        detected = true;
        setExtensionDetected(true);
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    };
    
    // Check immediately
    checkExtension();
    
    if (!detected) {
      // Keep checking every 100ms for 1 seconds
      intervalId = setInterval(checkExtension, 100);
      
      // After 5 seconds, stop checking and set to false if not found
      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (!detected) {
          setExtensionDetected(false);
        }
      }, 1000);
    }
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);
  
  const handleDismiss = () => {
    setBannerDismissed(true);
    localStorage.setItem("extensionBannerDismissed", "true");
  };
  
  if (extensionDetected !== false || bannerDismissed) {
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