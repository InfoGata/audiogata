import React from "react";
import {
  ExtensionProvider as BaseExtensionProvider,
  ExtensionContext,
} from "@infogata/extension-components";
import type { ExtensionContextType } from "@infogata/extension-components";

export type { ExtensionContextType };
export { ExtensionContext };

export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <BaseExtensionProvider>
      {children}
    </BaseExtensionProvider>
  );
};
