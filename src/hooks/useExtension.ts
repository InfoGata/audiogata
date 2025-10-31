import { useContext } from "react";
import { ExtensionContext } from "@/contexts/ExtensionContext";
import type { ExtensionContextType } from "@/contexts/ExtensionContext";

export const useExtension = (): ExtensionContextType => {
  const context = useContext(ExtensionContext);
  if (context === undefined) {
    throw new Error("useExtension must be used within an ExtensionProvider");
  }
  return context;
};
