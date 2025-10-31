import React, { createContext, useEffect, useState } from "react";
import { hasExtension } from "@/utils";

export interface ExtensionContextType {
  extensionDetected: boolean | null;
}

export const ExtensionContext = createContext<ExtensionContextType | undefined>(undefined);

export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensionDetected, setExtensionDetected] = useState<boolean | null>(null);

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

  return (
    <ExtensionContext.Provider value={{ extensionDetected }}>
      {children}
    </ExtensionContext.Provider>
  );
};
