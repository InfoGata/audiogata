import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePlugins from "@/hooks/usePlugins";
import { AliasError, normalizeAlias } from "@/lib/plugin-alias";
import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const errorKeys = {
  invalid: "plugins:aliasErrorInvalid",
  tooShort: "plugins:aliasErrorTooShort",
  isPluginId: "plugins:aliasErrorIsPluginId",
  taken: "plugins:aliasErrorTaken",
} as const satisfies Record<AliasError, string>;

type Props = {
  pluginId: string;
  alias?: string;
};

/**
 * Lets the user rename the plugin's url alias. Renaming is the escape hatch
 * that makes aliases safe to hand out: whoever installs a plugin decides what
 * it is called here, not whoever published it first.
 */
const PluginAliasField: React.FC<Props> = ({ pluginId, alias }) => {
  const { setPluginAlias } = usePlugins();
  const { t } = useTranslation(["plugins", "common"]);
  const navigate = useNavigate();
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(alias ?? "");
  const [error, setError] = React.useState<AliasError | null>(null);

  const startEditing = () => {
    setValue(alias ?? "");
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const result = await setPluginAlias(pluginId, normalizeAlias(value));
    if (result) {
      setError(result);
      return;
    }
    setEditing(false);
    // The alias is in the current url, so move to the new one rather than
    // leaving the address bar pointing at a name that no longer resolves.
    navigate({
      to: "/plugins/$pluginId",
      params: { pluginId },
      replace: true,
    });
  };

  // Laid out to match AboutLink, which renders every other row of the plugin
  // details list.
  return (
    <div className="m-1 flex space-x-4 rounded-md py-2 pl-4 pr-16 items-center">
      <div className="space-y-1 w-full">
        <p className="text-sm font-medium leading-none">
          {t("plugins:urlAlias")}
        </p>
        {editing ? (
          <>
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="h-8 font-mono text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={save}
                aria-label={t("common:save")}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditing(false)}
                aria-label={t("common:cancel")}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            {error ? (
              <p className="text-destructive text-xs">{t(errorKeys[error])}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                {t("plugins:urlAliasDescription", {
                  alias: normalizeAlias(value) || "…",
                })}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground font-mono break-words">
              {alias}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={startEditing}
              aria-label={t("plugins:renameAlias")}
            >
              <PencilIcon className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginAliasField;
