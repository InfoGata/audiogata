import { Button } from "@/components/ui/button";
import { ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Shown in place of a route whose loader or component threw. It renders
 * inside the root layout, so the player keeps playing and the rest of the app
 * stays usable; AppErrorBoundary covers failures above the router.
 */
const RouteError: React.FC<ErrorComponentProps> = ({ error, reset }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const retry = async () => {
    // Loaders only run again once invalidated; reset alone would re-render
    // the same failed match.
    await router.invalidate();
    reset();
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <h1 className="text-xl font-semibold">{t("pageErrorTitle")}</h1>
      <Button onClick={retry}>{t("tryAgain")}</Button>
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">{t("showDetails")}</summary>
        <p className="mt-2 break-all font-mono">{error.message}</p>
      </details>
    </div>
  );
};

export default RouteError;
