import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { requestAppDataReset, ResetScope } from "@/lib/reset-app-data";
import { TriangleAlert } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * The fallback deliberately reads no app context. It renders in place of the
 * tree that just failed, so anything it consumed -- the store, the plugin
 * context, the router -- is either the thing that broke or unreachable from
 * here. i18next is the one exception: it's a module-level singleton initialized
 * by importing src/i18n, not a provider.
 */
const AppErrorFallback: React.FC<{ error: unknown; onRetry: () => void }> = ({
  error,
  onRetry,
}) => {
  const { t } = useTranslation();
  const [confirmScope, setConfirmScope] = React.useState<ResetScope | null>(
    null
  );

  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <h1 className="text-xl font-semibold">{t("appCrashTitle")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("appCrashDescription")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRetry}>{t("tryAgain")}</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("reloadApp")}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" onClick={() => setConfirmScope("state")}>
          {t("resetAppState")}
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmScope("all")}
        >
          {t("resetAppData")}
        </Button>
      </div>
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">{t("showDetails")}</summary>
        <p className="mt-2 break-all font-mono">{message}</p>
      </details>
      <Alert
        open={confirmScope !== null}
        setOpen={(open) => !open && setConfirmScope(null)}
        title={
          confirmScope === "all" ? t("resetAppData") : t("resetAppState")
        }
        description={
          confirmScope === "all"
            ? t("resetAppDataConfirm")
            : t("resetAppStateConfirm")
        }
        confirm={() => confirmScope && requestAppDataReset(confirmScope)}
      />
    </div>
  );
};

type Props = { children: React.ReactNode };
type State = { error: unknown | null };

/**
 * The outermost boundary, above every provider in main.tsx.
 *
 * Route errors are handled by the router's defaultErrorComponent, but that
 * only covers the tree below RouterProvider. Redux-persist rehydration, plugin
 * loading and theme setup all run above it -- and a throw from any of them
 * would otherwise unmount the app to a blank page with no way back.
 */
class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // React 19 only console.errors what a boundary caught, so nothing listening
    // on window -- PostHog's exception capture included -- would hear about the
    // app's worst failure. Re-raising it as an uncaught error puts it back in
    // front of those handlers without coupling this component to any of them.
    // Optional because jsdom doesn't implement reportError.
    window.reportError?.(error);
  }

  retry = () => this.setState({ error: null });

  render() {
    if (this.state.error === null) return this.props.children;
    return <AppErrorFallback error={this.state.error} onRetry={this.retry} />;
  }
}

export default AppErrorBoundary;
